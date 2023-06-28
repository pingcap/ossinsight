
import { CacheProvider } from './provider/CacheProvider';
import {DateTime} from 'luxon'
import pino from 'pino';
import {cacheHitCounter, cacheQueryHistogram, measure} from '../../plugins/metrics';

export const MAX_CACHE_TIME = DateTime.fromISO('2099-12-31T00:00:00')

export class NeedPreFetchError extends Error {
  readonly msg: string
  constructor(message: string) {
    super(message);
    this.msg = message
  }
}

export interface CachedData<T> {
  finishedAt: DateTime;
  data: T;
  refresh?: boolean;
  [key: string]: any;
}

const runningCaches = new Map<string, Cache<unknown>>()

export default class Cache<T> {
  _data!: Promise<CachedData<T>>

  constructor(
    private readonly log: pino.BaseLogger,
    private readonly cacheProvider: CacheProvider,
    private readonly key: string,
    private readonly cacheHours: number,
    private readonly onlyFromCache: boolean = false,
    private readonly refreshCache: boolean = false,
  ) {
  }

  async load(fallback: () => Promise<CachedData<T>>): Promise<CachedData<T>> {
    // Only running one at the same time when multiple same query with same params.
    if (runningCaches.has(this.key)) {
      this.log.info(`Wait for previous same cache query <${this.key}>.`, )
      return await runningCaches.get(this.key)!._data as never
    } else {
      this.log.info(`Start cache query <${this.key}>.`, )
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
    const cachedData = await this.fetchDataFromCache();
    if (cachedData !== null && cachedData !== undefined) {
      this.log.info(`Hit cache of <${this.key}>.`);
      cacheHitCounter.inc();
      return cachedData;
    }

    // Fallback to fetch data from DB.
    this.log.debug(`No hit cache of query <${this.key}>.`);
    if (this.onlyFromCache && !this.refreshCache) {
      throw new NeedPreFetchError(`Failed to get data from cache and query <${this.key}> can only be executed in advance.`)
    }

    return await this.fetchDataFromDB(fallback);
  }

  private async fetchDataFromDB(fallback: () => Promise<CachedData<T>>):Promise<CachedData<T>> {
    // Execute query.
    this.log.info(`⚡️ Executing query <${this.key}>.`);
    const start = DateTime.now();
    const result = await fallback();
    const end = DateTime.now();
    const duration = end.diff(start, 'seconds').seconds;
    this.log.info(`✅️ Finished executing query <${this.key}> in ${duration} seconds.`);

    // Update cache async.
    const expire = this.cacheHours > 0 ? Math.round(this.cacheHours * 3600) : -1;
    result.expiresAt = expire > 0 ? DateTime.now().plus({hours: expire}) : MAX_CACHE_TIME;
    measure(cacheQueryHistogram.labels({op: 'set'}), async () => {
      const start = DateTime.now();
      await this.cacheProvider.set(this.key, JSON.stringify(result), {
        EX: expire
      });
      const end = DateTime.now();
      const duration = end.diff(start, 'seconds').seconds;
      this.log.info(`✅️ Finished cache setting for query <${this.key}> in ${duration} seconds.`);
    }).catch((err) => {
      console.error(`Failed to write cache for query <${this.key}>:`, err)
      this.log.error(err, `Failed to write cache for query <${this.key}>.`);
    });

    result.refresh = true;
    return result;
  }

  // TODO: make the error more clear.
  private async fetchDataFromCache():Promise<CachedData<T> | null> {
    try {
      const json = await measure(
        cacheQueryHistogram.labels({op: 'get'}),
        async () => await this.cacheProvider.get(this.key)
      ) as any;

      if (typeof json === 'string') {
        return JSON.parse(json);
      } else if (typeof json === 'object' && json !== null) {
        return json;
      }
    } catch (err) {
      console.error(`Cache of query ${this.key} is broken.`, err);
      this.log.error(err, `Cache of query ${this.key} is broken.`);
    }
    return null;
  }

}
