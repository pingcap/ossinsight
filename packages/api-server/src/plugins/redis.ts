import fp from "fastify-plugin";
import fastifyRedis from "@fastify/redis";
import {redisConnection} from "../utils/redis-connection";

export default fp(async (app) => {
    app.register(fastifyRedis, {
      ...redisConnection(app.config.REDIS_URL, process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'),
      connectTimeout: 5000, commandTimeout: 5000,
      maxRetriesPerRequest: 1, enableOfflineQueue: false,
    });
}, {
    name: '@ossinsight/redis',
    dependencies: [
        '@fastify/env'
    ]
});
