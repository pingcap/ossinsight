let redis: RedisDataSource | undefined;

export function getTestRedis () {
    if (!redis) {
        throw new Error('Redis test container not initialized. Call and `await bootstrapTestRedis()` in `__tests__/helpers/redis.ts`');
    }
    return redis;
}

export async function bootstrapTestRedis () {
    if (redis) {
        return redis;
    }
    const _redis = new RedisDataSource("0");
    process.env.REDIS_URL = _redis.url();
    redis = _redis;
    return redis;
}

export async function releaseTestRedis () {
    if (redis) {
        process.env.REDIS_URL = '';
        redis = undefined;
    }
}

export class RedisDataSource {
    public readonly host: string;
    public readonly port: number;

    constructor (public readonly database: string) {
        const { __REDIS_HOST, __REDIS_PORT } = process.env;
        if (!__REDIS_HOST || !__REDIS_PORT) {
            throw new Error('redis container not started');
        }
        this.host = __REDIS_HOST;
        this.port = parseInt(__REDIS_PORT);
    }

    url (): string {
        return `redis://${this.host}:${this.port}/${this.database}`;
    }

}