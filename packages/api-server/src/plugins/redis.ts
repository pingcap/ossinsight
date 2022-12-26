import fp from "fastify-plugin";
import fastifyRedis from "@fastify/redis";

export default fp(async (app) => {
    app.register(fastifyRedis, { url: app.config.REDIS_URL });
}, {
    name: 'fastify-redis',
    dependencies: [
        '@fastify/env'
    ]
});
