import {readFile} from 'fs/promises'
import path from 'path'
import {DateTime} from "luxon";
import type { QuerySchema } from '../../params.schema'
import {MysqlQueryExecutor} from "./MysqlQueryExecutor";
import Cache, {CachedData} from "./Cache";
import {RedisClientType, RedisDefaultModules, RedisModules, RedisScripts} from "redis";

export class BadParamsError extends Error {
  readonly msg: string
  constructor(public readonly name: string, message: string) {
    super(message);
    this.msg = message
  }
}

function buildParams(template: string, params: QuerySchema, values: Record<string, string>) {
  for (let {name, replaces, template: paramTemplate, default: defaultValue} of params.params) {
    const value = values[name] ?? defaultValue

    if (typeof value !== "undefined") {
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

  constructor(public readonly name: string) {
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

  async run<T>(
    params: Record<string, any>,
    redisClient: RedisClientType<RedisDefaultModules & RedisModules, RedisScripts>,
    executor: MysqlQueryExecutor<unknown>
  ): Promise<CachedData<T>> {
    const sql = await this.buildSql(params)
    const key = `query:${this.name}:${this.queryDef!.params.map(p => params[p.name]).join('_')}`;
    const cacheHours = this.queryDef!.cacheHours;
    const cache = new Cache<T>(key, cacheHours * 3600,redisClient)
    return cache.load(async () => {
      const start = DateTime.now()
      const data = await executor.execute(sql)
      const now = DateTime.now()
      return {
        params: params,
        requestedAt: start.toISO(),
        spent: now.diff(start).as('seconds'),
        sql,
        expiresAt: now.plus({hours: cacheHours}),
        data: data as any
      }
    })
  }
}
