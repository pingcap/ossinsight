import fp from "fastify-plugin";
import fastifyMetrics from 'fastify-metrics';

export default fp(async (app) => {
    await app.register(fastifyMetrics, {
        // Expose the registry only from the protected operational scope.
        endpoint: null,
    });
}, {
    name: '@ossinsight/metrics',
    dependencies: [
        '@fastify/env'
    ],
});
