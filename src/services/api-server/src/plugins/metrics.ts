import fp from "fastify-plugin";
import fastifyMetrics from 'fastify-metrics';

export default fp(async (app) => {
    await app.register(fastifyMetrics, {
        endpoint: '/metrics',
        name: process.env.NODE_APP_INSTANCE!,
    });
}, {
    name: '@ossinsight/metrics',
    dependencies: [
        '@fastify/env'
    ],
});
