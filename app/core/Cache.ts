import {DateTime} from 'luxon'
import consola from "consola";
import {RedisClientType, RedisDefaultModules, RedisModules, RedisScripts} from "redis";

export interface CachedData<T> {
  expiresAt: DateTime
  data: T
  [key: string]: any
}

const runningCaches = new Map<string, Cache<unknown>>()

const logger = consola.withTag('cache')

export default class Cache<T> {
  _data!: Promise<CachedData<T>>

  constructor(
    public readonly key: string,
    public readonly expires: number,
    public readonly redisClient: RedisClientType<RedisDefaultModules & RedisModules, RedisScripts>) {
  }

  async load(fallback: () => Promise<CachedData<T>>): Promise<CachedData<T>> {
    // Only running one at the same time when multiple same query with same params.
    if (runningCaches.has(this.key)) {
      logger.info('Wait for previous same cache query.')
      return await runningCaches.get(this.key)!._data as never
    }

    let _resolve: (data: CachedData<T>) => void
    let _reject: (err: any) => void
    this._data = new Promise<CachedData<T>>((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
    runningCaches.set(this.key, this as never)

    try {
      // Try to get cached value.
      try {
        const cachedValue = await this.redisClient.get(this.key);
        if (typeof cachedValue === 'string') {
          const res = JSON.parse(cachedValue);
          _resolve!(res)
          return res;
        } else {
          logger.info('Not hit cache of key %s', this.key)
        }
      } catch (e) {
        logger.warn(`cache <${this.key}> data is broken.`);
        this.redisClient.del(this.key).catch(() => {
          logger.error('Failed to delete the broken cache data of <%s>.', this.key);
        });
      }

      // Try to query data from database.
      const result = await fallback()

      // Write result to cache.
      try {
        await this.redisClient.set(this.key, JSON.stringify({
          ...result,
          expiresAt: result.expiresAt.toISO(),
        }), {
          EX: this.expires,
        });
      } catch (e) {
        logger.info('update failed', this.key, e)
      }

      _resolve!(result)
      return result
    } catch (e) {
      this._data.catch(() => {})
      _reject!(e)
      throw e
    } finally {
      runningCaches.delete(this.key)
    }
  }

}
