import {RedisClientType, RedisDefaultModules, RedisModules, RedisScripts} from "redis";
import { CacheOption, CacheProvider } from "./CacheProvider";

export default class RedisCacheProvider implements CacheProvider {

    constructor(
        private readonly redisClient: RedisClientType<RedisDefaultModules & RedisModules, RedisScripts>
    ) {

    }
    
    async set(key: string, value: any, options?: CacheOption): Promise<void> {
        await this.redisClient.set(key, JSON.stringify(value), options);
    }

    get(key: string): Promise<any> {
        return this.redisClient.get(key);
    }

}