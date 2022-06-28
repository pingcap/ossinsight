import { TiDBQueryExecutor } from "../TiDBQueryExecutor";
import Cache from './Cache'
import CachedTableCacheProvider from "./CachedTableCacheProvider";
import { CacheOption, CacheProvider } from "./CacheProvider";
import NormalTableCacheProvider from "./NormalTableCacheProvider";

export enum CacheProviderTypes {
    NORMAL_TABLE = 'NORMAL_TABLE',
    CACHED_TABLE = 'CACHED_TABLE',
}

class NoneCacheProvider implements CacheProvider {
    set(key: string, value: any, options?: CacheOption | undefined): void {
        return;
    }
    get(key: string) {
        return undefined;
    }

}

export default class CacheBuilder {

    private normalCacheProvider: CacheProvider;

    private cachedTableCacheProvider: CacheProvider;

    private noneCacheProvider: CacheProvider = new NoneCacheProvider();

    private enableCache = true;

    constructor(
        queryExecutor: TiDBQueryExecutor,
        enableCache: boolean
    ) {
        this.normalCacheProvider = new NormalTableCacheProvider(queryExecutor);
        this.cachedTableCacheProvider = new CachedTableCacheProvider(queryExecutor);
        this.enableCache = enableCache;
    }

    build(
        cacheProvider: string = CacheProviderTypes.CACHED_TABLE, key: string, cacheHours: number, refreshHours: number, 
        onlyFromCache?: boolean, refreshCache?: boolean
    ): Cache<any> {
        if (!this.enableCache) {
            return new Cache<any>(this.noneCacheProvider, key, -1, -1, false, false);
        }

        switch(cacheProvider) {
            case CacheProviderTypes.NORMAL_TABLE:
                return new Cache<any>(this.normalCacheProvider, key, cacheHours, refreshHours, onlyFromCache, refreshCache);
            case CacheProviderTypes.CACHED_TABLE:
                return new Cache<any>(this.cachedTableCacheProvider, key, cacheHours, refreshHours, onlyFromCache, refreshCache);
            default:
                throw new Error(`Invalid cache provider type ${cacheProvider}.`);
        }
    }

}