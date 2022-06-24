import { TiDBQueryExecutor } from "../TiDBQueryExecutor";
import Cache from './Cache'
import CachedTableCacheProvider from "./CachedTableCacheProvider";
import { CacheProvider } from "./CacheProvider";
import NormalTableCacheProvider from "./NormalTableCacheProvider";

export enum CacheProviderTypes {
    NORMAL_TABLE = 'NORMAL_TABLE',
    CACHED_TABLE = 'CACHED_TABLE',
}

export default class CacheBuilder {

    private normalCacheProvider: CacheProvider;

    private cachedTableCacheProvider: CacheProvider;

    constructor(
        queryExecutor: TiDBQueryExecutor
    ) {
        this.normalCacheProvider = new NormalTableCacheProvider(queryExecutor);
        this.cachedTableCacheProvider = new CachedTableCacheProvider(queryExecutor);
    }

    build(
        cacheProvider: string = CacheProviderTypes.CACHED_TABLE, key: string, cacheHours: number, refreshHours: number, 
        onlyFromCache?: boolean, refreshCache?: boolean
    ): Cache<any> {
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