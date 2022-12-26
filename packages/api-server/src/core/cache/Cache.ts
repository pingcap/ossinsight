
import { CacheProvider } from './provider/CacheProvider';
import {DateTime} from 'luxon'
import pino from 'pino';
import {cacheHitCounter, cacheQueryTimer, measure} from '../../plugins/metrics';

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
    let cachedData = null;
    if (this.cacheHours !== 0) {
      cachedData = await this.fetchDataFromCache();
    }

    if (cachedData != null) {
      this.log.info(`Hit cache of ${this.key}.`);
      cacheHitCounter.inc()

      if (this.refreshCache) {
        this.log.info(`Initiative refresh for key: ${this.key}.`);
        return await this.fetchDataFromDB(fallback);
      }

      return cachedData;
    } else {
      this.log.debug('No hit cache of %s.', this.key);

      if (this.onlyFromCache && !this.refreshCache) {
        throw new NeedPreFetchError(`Failed to get data, query ${this.key} can only be executed in advance.`)
      }

      this.log.info('Do query for key: %s.', this.key);
      return await this.fetchDataFromDB(fallback);
    }
  }

  private async fetchDataFromDB(fallback: () => Promise<CachedData<T>>):Promise<CachedData<T>> {
    const result = await fallback();
    result.expiresAt = MAX_CACHE_TIME;

    // TODO: Write result to cache async.
    await measure(cacheQueryTimer.labels({op: 'set'}), async () => {
      await this.cacheProvider.set(this.key, JSON.stringify(result), {
        EX: this.cacheHours ? Math.round(this.cacheHours * 3600) : -1
      })
      .catch((err) => {
        this.log.error(err, 'Failed to write cache for key %s.', this.key);
      })
    });

    result.refresh = true;
    return result;
  }

  private async fetchDataFromCache():Promise<CachedData<T> | null> {
    try {
      const json = await measure(
        cacheQueryTimer.labels({op: 'get'}),
        () => this.cacheProvider.get(this.key)
      ) as any;

      if (typeof json === 'string') {
        return JSON.parse(json);
      } else if (typeof json === 'object' && json !== null) {
        return json;
      }
    } catch (err) {
      this.log.error(err, 'Cache <%s> data is broken.', this.key);
    }
    return null;
  }

}
