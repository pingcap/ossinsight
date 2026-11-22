import fp from "fastify-plugin";
import fastifyRedis from "@fastify/redis";

export default fp(async (app) => {
    app.register(fastifyRedis, {
      url: app.config.REDIS_URL, connectTimeout: 5000, commandTimeout: 5000,
      maxRetriesPerRequest: 1, enableOfflineQueue: false,
    });
}, {
    name: '@ossinsight/redis',
    dependencies: [
        '@fastify/env'
    ]
});
