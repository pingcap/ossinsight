import { createConnection } from "mysql2";
import { ConnectionWrapper, getConnectionOptions } from "../../utils/db";
import Cache from './Cache'
import CachedTableCacheProvider from "./CachedTableCacheProvider";
import { CacheOption, CacheProvider } from "./CacheProvider";
import NormalTableCacheProvider from "./NormalTableCacheProvider";

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

    constructor(enableCache: boolean) {
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
            return new Cache<any>(this.noneCacheProvider, key, -1, false, false);
        }

        switch(cacheProvider) {
            case CacheProviderTypes.NORMAL_TABLE:
                if (this.normalCacheProvider === undefined) {
                    throw new Error('Normal cache provider has not initialed.');
                }
                return new Cache<any>(this.normalCacheProvider, key, cacheHours, onlyFromCache, refreshCache);
            case CacheProviderTypes.CACHED_TABLE:
                if (this.cachedTableCacheProvider === undefined) {
                    throw new Error('Cached table cache provider has not initialed.');
                }
                return new Cache<any>(this.cachedTableCacheProvider, key, cacheHours, onlyFromCache, refreshCache);
            default:
                throw new Error(`Invalid cache provider type ${cacheProvider}.`);
        }
    }

}

