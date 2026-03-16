
import { CacheOption, CacheProvider } from "./provider/CacheProvider";

import Cache from './Cache'
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
        onlyFromCache?: boolean, refreshCache?: boolean
    ): Cache<any> {
        const keyWithPrefix = this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
        if (!this.enableCache) {
            return new Cache<any>(this.logger, this.noneCacheProvider, keyWithPrefix, -1, false, false);
        }

        switch(cacheProvider) {
            case CacheProviderTypes.NORMAL_TABLE:
                if (this.normalCacheProvider === undefined) {
                    throw new Error('Normal cache provider has not initialed.');
                }
                return new Cache<any>(this.logger, this.normalCacheProvider, keyWithPrefix, cacheHours, onlyFromCache, refreshCache);
            case CacheProviderTypes.CACHED_TABLE:
                if (this.cachedTableCacheProvider === undefined) {
                    throw new Error('Cached table cache provider has not initialed.');
                }
                return new Cache<any>(this.logger, this.cachedTableCacheProvider, keyWithPrefix, cacheHours, onlyFromCache, refreshCache);
            default:
                throw new Error(`Invalid cache provider type ${cacheProvider}.`);
        }
    }

}

