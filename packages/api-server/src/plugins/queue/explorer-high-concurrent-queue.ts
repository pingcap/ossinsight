import fp from "fastify-plugin";
import {Queue} from "bullmq";

declare module 'fastify' {
  interface FastifyInstance {
    explorerHighConcurrentQueue: Queue;
  }
}

export const EXPLORER_HIGH_CONCURRENT_QUEUE_NAME = "explorer_high_concurrent_queue";

export default fp(async (app) => {
  const explorerHighConcurrentQueue = new Queue(EXPLORER_HIGH_CONCURRENT_QUEUE_NAME, {
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