import {mkdir, readFile} from 'fs/promises'
import path from 'path'
import Cache, {CachedData} from "./Cache";
import {DateTime} from "luxon";
import type { QuerySchema } from '../../params.schema'

export type QueryParams = QuerySchema

export class BadParamsError extends Error {
  readonly msg: string
  constructor(public readonly name: string, message: string) {
    super(message);
    this.msg = message
  }
}

function buildParams(template: string, params: QueryParams, values: Record<string, string>) {
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

  private readonly path: string
  template: string | undefined = undefined
  params: QueryParams | undefined = undefined
  private readonly loadingPromise: Promise<boolean>

  constructor(public readonly name: string) {
    this.path = path.join(process.cwd(), 'queries', name)
    const templateFilePath = path.join(this.path, 'template.sql')
    const paramsFilePath = path.join(this.path, 'params.json')

    this.loadingPromise = new Promise<boolean>(async (resolve, reject) => {
      try {
        this.template = await readFile(templateFilePath, {encoding: "utf-8"})
        this.params = JSON.parse(await readFile(paramsFilePath, {encoding: 'utf-8'})) as QueryParams
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
    return buildParams(this.template!, this.params!, params)
  }

  async run<T>(params: Record<string, any>, executor: QueryExecutor<T>): Promise<CachedData<T>> {
    const sql = await this.buildSql(params)
    const cachePath = path.join(this.path, '.cache')
    await mkdir(cachePath, {recursive: true})
    const cache = new Cache<T>(path.join(cachePath, `${this.params!.params.map(p => params[p.name]).join('_')}.json`))
    return cache.load(async () => {
      const start = DateTime.now()
      const data = await executor.execute(sql)
      const now = DateTime.now()
      return {
        params: params,
        requestedAt: start.toISO(),
        spent: now.diff(start).as('seconds'),
        sql,
        expiresAt: now.plus({hours: this.params!.cacheHours}),
        data: data
      }
    })
  }
}