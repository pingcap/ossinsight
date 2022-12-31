import fp from "fastify-plugin";
import {Queue} from "bullmq";

declare module 'fastify' {
  interface FastifyInstance {
    explorerHighConcurrentQueue: Queue;
  }
}

export default fp(async (app) => {
  const explorerHighConcurrentQueue = new Queue("explorer_high_concurrent_queue", {
    connection: app.redis,
  });
  app.decorate('explorerHighConcurrentQueue', explorerHighConcurrentQueue);
}, {
  name: '@ossinsight/explorer-high-concurrent-queue',
  dependencies: [
    '@fastify/env',
    'fastify-redis',
  ]
});