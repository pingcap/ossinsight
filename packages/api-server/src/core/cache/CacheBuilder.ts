import { CacheOption, CacheProvider } from "./provider/CacheProvider";
import { ConnectionWrapper, getConnectionOptions } from "../../utils/db";

import Cache from './Cache'
import CachedTableCacheProvider from "./provider/CachedTableCacheProvider";
import NormalTableCacheProvider from "./provider/NormalTableCacheProvider";
import pino from "pino";

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

    private normalCacheProvider?: CacheProvider;

    private cachedTableCacheProvider?: CacheProvider;

    private noneCacheProvider: CacheProvider = new NoneCacheProvider();

    private enableCache = true;

    constructor(readonly log: pino.Logger, enableCache: boolean) {
        this.enableCache = enableCache;
        if (enableCache) {
            const normalCacheConn = new ConnectionWrapper(getConnectionOptions());
            this.normalCacheProvider = new NormalTableCacheProvider(normalCacheConn);

            const cachedTableCacheConn = new ConnectionWrapper(getConnectionOptions());
            this.cachedTableCacheProvider = new CachedTableCacheProvider(cachedTableCacheConn);
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

