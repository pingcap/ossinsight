
import { CacheProvider } from './provider/CacheProvider';
import {DateTime} from 'luxon'
import pino from 'pino';
import {cacheHitCounter, cacheQueryHistogram, measure} from '../../metrics';

export class NeedPreFetchError extends Error {
  readonly msg: string
  constructor(message: string) {
    super(message);
    this.msg = message
  }
}

export interface CachedData<T> {
  data: T;
  finishedAt: DateTime;
  [key: string]: any;
}

export interface CachedResult<T> extends CachedData<T> {
  expiresAt: DateTime | null;
  refresh?: boolean;
}

const runningCaches = new Map<string, Cache<any>>()

export default class Cache<T> {
  _data!: Promise<CachedResult<T>>

  constructor(
    private readonly log: pino.BaseLogger,
    private readonly cacheProvider: CacheProvider,
    private readonly key: string,
    private readonly cacheHours: number,
    private readonly onlyFromCache: boolean = false,
    private readonly refreshCache: boolean = false,
  ) {
  }

  async load(fallback: () => Promise<CachedData<T>>): Promise<CachedResult<T>> {
    // Only running one at the same time when multiple same query with same params.
    if (runningCaches.has(this.key)) {
      this.log.info(`Wait for previous same cache query <${this.key}>.`, )
      return await runningCaches.get(this.key)!._data as never
    }

    let _resolve: (data: CachedResult<T>) => void
    let _reject: (err: any) => void
    this._data = new Promise<CachedResult<T>>((resolve, reject) => {
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

  private async loadInternal(fallback: () => Promise<CachedData<T>>): Promise<CachedResult<T>> {
    // Initiative refresh query will ignore cache.
    if (this.refreshCache) {
      this.log.info(`🔄 Initiative refresh query for key: <${this.key}>.`);
      return await this.fetchDataFromDB(fallback);
    }

    // If cacheHours is 0, it means disable cache for this query.
    if (this.cacheHours === 0) {
      this.log.info(`🔄 No cache for key: <${this.key}>.`);
      return await this.fetchDataFromDB(fallback);
    }

    // Try to get data from cache.
    try {
      const cachedData = await this.fetchDataFromCache();
      if (cachedData !== null && cachedData !== undefined) {
        this.log.info(`Hit cache of <${this.key}>.`);
        cacheHitCounter.inc();
        return cachedData;
      }
    } catch (err) {
      this.log.warn(err, `Failed to get data from cache for <${this.key}>.`);
    }

    // No cache hit, Fallback to fetch data from DB.
    if (this.onlyFromCache) {
      throw new NeedPreFetchError(`Failed to get data from cache, query <${this.key}> can only be executed in advance.`)
    }

    return await this.fetchDataFromDB(fallback);
  }

  private async fetchDataFromDB(fallback: () => Promise<CachedData<T>>):Promise<CachedResult<T>> {
    // Execute query.
    this.log.info(`⚡️ Executing query <${this.key}>.`);
    const start = DateTime.now();
    const result = await fallback();
    const end = DateTime.now();
    const duration = end.diff(start, 'seconds').seconds;
    this.log.info(`✅️ Finished executing query <${this.key}> in ${duration} seconds.`);

    // Update cache async.
    const ttl = this.cacheHours > 0 ? Math.round(this.cacheHours * 3600) : -1;
    const cachedResult: CachedResult<any> = {
      ...result,
      expiresAt: ttl > 0 ? DateTime.now().plus({seconds: ttl}) : null,
    }
    this.saveDataToCache(cachedResult, ttl).catch(err => {
      this.log.error(err, `Failed to save data to cache for <${this.key}>.`);
    });

    return {
      ...cachedResult,
      refresh: true,
    };
  }

  private async saveDataToCache(data: CachedData<T>, ttl: number):Promise<void> {
    return await measure(cacheQueryHistogram.labels({op: 'set'}), async () =>
      await this.cacheProvider.set(this.key, JSON.stringify(data), {
        EX: ttl
      })
    );
  }

  private async fetchDataFromCache():Promise<CachedResult<T> | null> {
    return await measure(cacheQueryHistogram.labels({op: 'get'}), async () => {
      const cachedResult = await this.cacheProvider.get(this.key);
      if (cachedResult) {
        return {
          ...cachedResult,
          expiredAt: cachedResult.expiresAt ? DateTime.fromISO(cachedResult.expiresAt) : null,
          finishedAt: DateTime.fromISO(cachedResult.finishedAt),
        };
      } else {
        return null;
      }
    });
  }
}
