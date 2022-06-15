import {RedisClientType, RedisDefaultModules, RedisModules, RedisScripts} from "redis";
import { TiDBQueryExecutor } from "../TiDBQueryExecutor";
import Cache from './Cache'
import CachedTableCacheProvider from "./CachedTableCacheProvider";
import { CacheProvider } from "./CacheProvider";
import NormalTableCacheProvider from "./NormalTableCacheProvider";
import RedisCacheProvider from "./RedisCacheProvider";

export enum CacheProviderTypes {
    NORMAL_TABLE = 'NORMAL_TABLE',
    CACHED_TABLE = 'CACHED_TABLE',
    REDIS = 'REDIS',
}

export default class CacheBuilder {

    private normalCacheProvider: CacheProvider;

    private cachedTableCacheProvider: CacheProvider;

    private redisCacheProvider: CacheProvider;

    constructor(
        redisClient: RedisClientType<RedisDefaultModules & RedisModules, RedisScripts>,
        queryExecutor: TiDBQueryExecutor
    ) {
        this.normalCacheProvider = new NormalTableCacheProvider(queryExecutor);
        this.cachedTableCacheProvider = new CachedTableCacheProvider(queryExecutor);
        this.redisCacheProvider = new RedisCacheProvider(redisClient);
    }

    build(
        cacheProvider: string = CacheProviderTypes.CACHED_TABLE, key: string, cacheHours: number, refreshHours: number, 
        onlyFromCache?: boolean, refreshCache?: boolean
    ): Cache<any> {
        switch(cacheProvider) {
            case CacheProviderTypes.NORMAL_TABLE:
                return new Cache<any>(this.normalCacheProvider, key, cacheHours, refreshHours, onlyFromCache, refreshCache);
            case CacheProviderTypes.REDIS:
                return new Cache<any>(this.redisCacheProvider, key, cacheHours, refreshHours, onlyFromCache, refreshCache);
            case CacheProviderTypes.CACHED_TABLE:
                return new Cache<any>(this.cachedTableCacheProvider, key, cacheHours, refreshHours, onlyFromCache, refreshCache);
            default:
                throw new Error(`Invalid cache provider type ${cacheProvider}.`);
        }
    }

}