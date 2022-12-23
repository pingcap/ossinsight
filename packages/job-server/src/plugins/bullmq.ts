import fp from 'fastify-plugin';
import { default as fastifyBullMQ, FastifyQueueOptions} from "../lib/bullmq";

export default fp<FastifyQueueOptions>(async (app, opts) => {
    await app.register(fastifyBullMQ, {
        bullPath: '*/plugins/jobs/**/*.js',
        connection: app.redis,
    });
}, {
    name: '@ossinsight/bullmq',
    dependencies: [
        '@fastify/env',
        'fastify-redis'
    ],
});

