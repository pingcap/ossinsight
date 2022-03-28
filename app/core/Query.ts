import {readFile} from 'fs/promises'
import path from 'path'
import {DateTime} from "luxon";
import type { QuerySchema } from '../../params.schema'
import {MysqlQueryExecutor} from "./MysqlQueryExecutor";
import Cache, {CachedData} from "./Cache";
import {RedisClientType, RedisDefaultModules, RedisModules, RedisScripts} from "redis";
import consola from "consola";
import {PoolConnection} from "mysql2";
import {dataQueryTimer, measure, tidbQueryCounter} from "../metrics";

const MAX_CACHE_TIME = DateTime.fromISO('2099-12-31T00:00:00')

export class BadParamsError extends Error {
  readonly msg: string
  constructor(public readonly name: string, message: string) {
    super(message);
    this.msg = message
  }
}

export class SQLExecuteError extends Error {
  readonly sql: string
  constructor(public readonly name: string, sql: string) {
    super(sql);
    this.sql = sql
  }
}

export class QueryTemplateNotFoundError extends Error {
  readonly msg: string
  constructor(message: string) {
    super(message);
    this.msg = message
  }
}

export function buildParams(template: string, querySchema: QuerySchema, values: Record<string, string>) {
  for (let {name, replaces, template: paramTemplate, default: defaultValue, pattern} of querySchema.params) {
    const value = values[name] ?? defaultValue

    if (typeof value !== "undefined") {
      if (typeof pattern !== "undefined") {
        const regexp = new RegExp(pattern);
        if (!regexp.test(value)) {
          throw new BadParamsError(name, 'bad param ' + name)
        }
      }

      let targetValue: string
      if (paramTemplate) {
        targetValue = paramTemplate[String(value)]
        if (typeof targetValue === "undefined") {
          throw new BadParamsError(name, 'bad param ' + name)
        }
      } else {
        targetValue = String(value)
      }
      template = template.replaceAll(replaces, targetValue)
    } else {
      throw new BadParamsError(name, 'require param ' + name)
    }
  }
  return template
}

export interface QueryExecutor<T> {
  execute (sql: string): Promise<T>
}

const logger = consola.withTag('query')

export default class Query {

  public readonly path: string
  template: string | undefined = undefined
  queryDef: QuerySchema | undefined = undefined
  private readonly loadingPromise: Promise<boolean>

  constructor(
    public readonly name: string,
    public readonly redisClient: RedisClientType<RedisDefaultModules & RedisModules, RedisScripts>,
    public readonly executor: MysqlQueryExecutor<unknown>,
  ) {
    this.path = path.join(process.cwd(), 'queries', name)
    const templateFilePath = path.join(this.path, 'template.sql')
    const paramsFilePath = path.join(this.path, 'params.json')

    this.loadingPromise = new Promise<boolean>(async (resolve, reject) => {
      try {
        this.template = await readFile(templateFilePath, {encoding: "utf-8"})
        this.queryDef = JSON.parse(await readFile(paramsFilePath, {encoding: 'utf-8'})) as QuerySchema
        resolve(true)
      } catch (err) {
        logger.log('Failed to load query template file: ', err)
        reject(new QueryTemplateNotFoundError('Failed to load query template file.'))
      }
    })
  }

  ready(): Promise<boolean> {
    return this.loadingPromise
  }

  async buildSql(params: Record<string, any>): Promise<string> {
    await this.ready()
    return buildParams(this.template!, this.queryDef!, params)
  }

  async run <T> (params: Record<string, any>, refreshCache: boolean = false, conn?: PoolConnection): Promise<CachedData<T>> {
    const sql = await this.buildSql(params)
    const key = `query:${this.name}:${this.queryDef!.params.map(p => params[p.name]).join('_')}`;
    const { cacheHours = -1, refreshHours = -1, onlyFromCache = false } = this.queryDef!;
    const cache = new Cache<T>(this.redisClient, key, cacheHours, refreshHours, onlyFromCache, refreshCache);

    return cache.load(async () => {
      return await measure(dataQueryTimer, async () => {
        try {
          const start = DateTime.now()
          tidbQueryCounter.labels({ query: this.name, phase: 'start' }).inc()

          let data;
          if (conn) {
            data = await this.executor.executeWithConn(sql, conn)
          } else {
            data = await this.executor.execute(sql)
          }

          const end = DateTime.now()
          tidbQueryCounter.labels({ query: this.name, phase: 'success' }).inc()

          return {
            params: params,
            requestedAt: start.toISO(),
            spent: end.diff(start).as('seconds'),
            sql,
            expiresAt: cacheHours === -1 ? MAX_CACHE_TIME : end.plus({hours: cacheHours}),
            data: data as any
          }
        } catch (e) {
          tidbQueryCounter.labels({ query: this.name, phase: 'error' }).inc()
          if (e) {
            (e as any).sql = sql
          }
          throw e
        }
      })
    })
  }
}
