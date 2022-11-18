import { CacheOption, CacheProvider } from "./provider/CacheProvider";

import Cache from './Cache'
import CachedTableCacheProvider from "./provider/CachedTableCacheProvider";
import NormalTableCacheProvider from "./provider/NormalTableCacheProvider";
import pino from "pino";
import {Connection} from "mysql2/promise";

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
        private readonly log: pino.Logger,
        private readonly enableCache: boolean = false,
        conn?: Connection
    ) {
        if (this.enableCache && conn !== undefined) {
            this.normalCacheProvider = new NormalTableCacheProvider(conn);
            this.cachedTableCacheProvider = new CachedTableCacheProvider(conn);
        }
    }

    build(
        cacheProvider: string = CacheProviderTypes.CACHED_TABLE, key: string, cacheHours: number,
        onlyFromCache?: boolean, refreshCache?: boolean
    ): Cache<any> {
        if (!this.enableCache) {
            const log = this.log.child({ 'cache-provider': 'none' });
            return new Cache<any>(log, this.noneCacheProvider, key, -1, false, false);
        }

        switch(cacheProvider) {
            case CacheProviderTypes.NORMAL_TABLE:
                if (this.normalCacheProvider === undefined) {
                    throw new Error('Normal cache provider has not initialed.');
                }
                return new Cache<any>(this.log.child({ 'cache-provider': 'normal-table' }), this.normalCacheProvider, key, cacheHours, onlyFromCache, refreshCache);
            case CacheProviderTypes.CACHED_TABLE:
                if (this.cachedTableCacheProvider === undefined) {
                    throw new Error('Cached table cache provider has not initialed.');
                }
                return new Cache<any>(this.log.child({ 'cache-provider': 'cached-table' }), this.cachedTableCacheProvider, key, cacheHours, onlyFromCache, refreshCache);
            default:
                throw new Error(`Invalid cache provider type ${cacheProvider}.`);
        }
    }

}

