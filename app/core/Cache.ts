import {DateTime} from 'luxon'
import consola from "consola";
import {RedisClientType, RedisDefaultModules, RedisModules, RedisScripts} from "redis";
import {cacheHitCounter, measure, redisQueryTimer} from "../metrics";

export const MAX_CACHE_TIME = DateTime.fromISO('2099-12-31T00:00:00')

export class NeedPrefetchError extends Error {
  readonly msg: string
  constructor(message: string) {
    super(message);
    this.msg = message
  }
}

export interface CachedData<T> {
  expiresAt: DateTime;
  data: T;
  [key: string]: any;
}

const runningCaches = new Map<string, Cache<unknown>>()

const logger = consola.withTag('cache')

export default class Cache<T> {
  _data!: Promise<CachedData<T>>

  constructor(
    private readonly redisClient: RedisClientType<RedisDefaultModules & RedisModules, RedisScripts>,
    private readonly key: string,
    private readonly cachedHours: number,
    private readonly refreshHours: number,
    private readonly onlyFromCache: boolean = false,
    private readonly refreshCache: boolean = false,
    ) {
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
      const result = await this.loadInternal(fallback);
      _resolve!(result);
      return result;
    } catch (e) {
      this._data.catch(() => {})
      _reject!(e)
      throw e
    } finally {
      runningCaches.delete(this.key)
    }
  }

  private async loadInternal(fallback: () => Promise<CachedData<T>>) {
    const cachedData = await this.fetchDataFromCache();

    if (cachedData != null) {
      logger.info(`Hit cache of ${this.key}.`);
      cacheHitCounter.inc()

      const cacheOutOfDate = DateTime.now().diff(DateTime.fromISO(cachedData.requestedAt), 'hours').hours >= this.refreshHours;
      if (cacheOutOfDate && this.refreshCache) {
        logger.info(`Initiative refresh for key: ${this.key}.`);
        return await this.fetchDataFromDB(fallback);
      }

      return cachedData;
    } else {
      logger.debug(`No hit cache of ${this.key}.`);

      if (this.onlyFromCache && !this.refreshCache) {
        throw new NeedPrefetchError(`Failed to get data, query ${this.key} can only be executed in advance.`)
      }

      logger.info(`Do query for key: ${this.key}.`);

      return await this.fetchDataFromDB(fallback);
    }
  }

  private async fetchDataFromDB(fallback: () => Promise<CachedData<T>>):Promise<CachedData<T>> {
    const result = await fallback()

    // Write result to cache.

    try {
      await measure(redisQueryTimer.labels({op: 'set'}), async () => {
        if (this.cachedHours === -1) {
          await this.redisClient.set(this.key, JSON.stringify(result));
        } else {
          await this.redisClient.set(this.key, JSON.stringify(result), {
            EX: this.cachedHours * 3600,
          });
        }
      })
    } catch (err) {
      logger.error('Failed to write cache for key %s.', this.key, err)
    }

    return result;
  }

  private async fetchDataFromCache():Promise<CachedData<T> | null> {
    try {
      const json = await measure(
        redisQueryTimer.labels({op: 'get'}),
        () => this.redisClient.get(this.key)
      )
      if (typeof json === 'string') {
        return JSON.parse(json);
      }
    } catch (err) {
      logger.error('Cache <%s> data is broken.', this.key, err);
    }
    return null;
  }

}
