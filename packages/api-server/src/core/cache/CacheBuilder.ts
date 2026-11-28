
import { CacheOption, CacheProvider } from "./provider/CacheProvider";

import Cache from './Cache'
import RequestCacheProvider from './provider/RequestCacheProvider';
import CachedTableCacheProvider from "./provider/CachedTableCacheProvider";
import NormalTableCacheProvider from "./provider/NormalTableCacheProvider";
import pino from "pino";
import {Pool} from "mysql2/promise";

export enum CacheProviderTypes {
    NORMAL_TABLE = 'NORMAL_TABLE',
    CACHED_TABLE = 'CACHED_TABLE',
}

class NoneCacheProvider implements CacheProvider {
    set(key: string, value: any, options?: CacheOption | undefined) {
        return Promise.resolve();
    }
    get(key: string) {
        return Promise.resolve();
    }
}

export default class CacheBuilder {

    private readonly normalCacheProvider?: CacheProvider;

    private readonly cachedTableCacheProvider?: CacheProvider;

    private readonly requestProviders = new Map<CacheProvider, RequestCacheProvider>();

    private noneCacheProvider: CacheProvider = new NoneCacheProvider();

    constructor(
      private readonly logger: pino.Logger,
      private readonly enableCache: boolean = false,
      pool?: Pool,
      shadowPool?: Pool,
      private readonly keyPrefix: string = '',
    ) {
        if (this.enableCache && pool !== undefined) {
            this.normalCacheProvider = new NormalTableCacheProvider(logger, pool, shadowPool);
            this.cachedTableCacheProvider = new CachedTableCacheProvider(logger, pool, shadowPool);
        }
    }

    // TODO: no longer use cached table cache provider.
    build(
        cacheProvider: string = CacheProviderTypes.CACHED_TABLE, key: string, cacheHours: number,
        onlyFromCache?: boolean, refreshCache?: boolean, writes: 'shared' | 'request' = 'shared'
    ): Cache<any> {
        const keyWithPrefix = this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
        if (!this.enableCache) {
            return new Cache<any>(this.logger, this.noneCacheProvider, keyWithPrefix, 0, onlyFromCache, false);
        }

        let provider: CacheProvider | undefined;
        switch (cacheProvider) {
            case CacheProviderTypes.NORMAL_TABLE: provider = this.normalCacheProvider; break;
            case CacheProviderTypes.CACHED_TABLE: provider = this.cachedTableCacheProvider; break;
            default: throw new Error(`Invalid cache provider type ${cacheProvider}.`);
        }
        if (!provider) throw new Error('Cache provider has not initialized.');
        if (writes === 'request' && !onlyFromCache) {
            let requestCache = this.requestProviders.get(provider);
            if (!requestCache) {
                requestCache = new RequestCacheProvider(provider);
                this.requestProviders.set(provider, requestCache);
            }
            provider = requestCache;
        }
        return new Cache<any>(this.logger, provider, keyWithPrefix, cacheHours, onlyFromCache, refreshCache);
    }

}

