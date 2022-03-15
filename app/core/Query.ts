import {readFile} from 'fs/promises'
import path from 'path'
import {DateTime} from "luxon";
import type { QuerySchema } from '../../params.schema'
import {MysqlQueryExecutor} from "./MysqlQueryExecutor";
import Cache, {CachedData} from "./Cache";
import {RedisClientType, RedisDefaultModules, RedisModules, RedisScripts} from "redis";

const MAX_CACHE_TIME = DateTime.fromISO('2099-12-31T00:00:00')

export class BadParamsError extends Error {
  readonly msg: string
  constructor(public readonly name: string, message: string) {
    super(message);
    this.msg = message
  }
}

function buildParams(template: string, querySchema: QuerySchema, values: Record<string, string>) {
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
      } catch (e) {
        reject(e)
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

  async run <T> (params: Record<string, any>, refreshCache: boolean = false): Promise<CachedData<T>> {
    const sql = await this.buildSql(params)
    const key = `query:${this.name}:${this.queryDef!.params.map(p => params[p.name]).join('_')}`;
    const { cacheHours = -1, refreshHours = -1, onlyFromCache = false } = this.queryDef!;
    const cache = new Cache<T>(this.redisClient, key, cacheHours, refreshHours, onlyFromCache, refreshCache);

    return cache.load(async () => {
      const start = DateTime.now()
      const data = await this.executor.execute(sql)
      const now = DateTime.now()
      return {
        params: params,
        requestedAt: start.toISO(),
        spent: now.diff(start).as('seconds'),
        sql,
        expiresAt: cacheHours === -1 ? MAX_CACHE_TIME : now.plus({hours: cacheHours}),
        data: data as any
      }
    })
  }
}
