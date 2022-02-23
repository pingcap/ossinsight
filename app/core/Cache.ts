import fs from 'fs/promises'
import {constants as FS_CONSTANTS} from 'fs'
import {DateTime} from 'luxon'
import consola from "consola";
import path from "path";

export interface CachedData<T> {
  expiresAt: DateTime
  data: T
  [key: string]: any
}

const runningCaches = new Map<string, Cache<unknown>>()

const logger = consola.withTag('cache')

export default class Cache<T> {
  _data!: Promise<CachedData<T>>

  constructor(public readonly path: string) {
  }

  async load(fallback: () => Promise<CachedData<T>>): Promise<CachedData<T>> {
    if (runningCaches.has(this.path)) {
      logger.info('wait for previous same cache query')
      return await runningCaches.get(this.path)!._data as never
    }
    let _resolve: (data: CachedData<T>) => void
    let _reject: (err: any) => void
    this._data = new Promise<CachedData<T>>((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
    runningCaches.set(this.path, this as never)
    try {
      try {
        await fs.mkdir(path.dirname(this.path), { recursive: true })
        await fs.access(this.path, FS_CONSTANTS.F_OK | FS_CONSTANTS.R_OK)
        logger.info('found cache file at %s', this.path)
        const content = await fs.readFile(this.path, {encoding: 'utf-8'})
        const {expiresAt: rawExpiresAt, ...rest} = JSON.parse(content)
        const expiresAt = DateTime.fromISO(rawExpiresAt)
        if (DateTime.now() < expiresAt) {
          logger.info('hit at %s', this.path)
          const res = {expiresAt, ...rest}
          _resolve!(res)
          return res
        } else {
          logger.info('expired at %s', this.path)
        }
      } catch (e) {
        logger.info('not hit at %s', this.path)
      }
      const result = await fallback()

      try {
        await fs.writeFile(this.path, JSON.stringify({
          ...result,
          expiresAt: result.expiresAt.toISO(),
        }))
      } catch (e) {
        logger.info('update failed', this.path, e)
      }
      _resolve!(result)
      return result
    } catch (e) {
      _reject!(e)
      throw e
    } finally {
      runningCaches.delete(this.path)
    }
  }

}