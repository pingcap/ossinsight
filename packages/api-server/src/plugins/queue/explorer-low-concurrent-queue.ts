import fp from "fastify-plugin";
import {Queue} from "bullmq";

declare module 'fastify' {
  interface FastifyInstance {
    explorerLowConcurrentQueue: Queue;
  }
}

export const EXPLORER_LOW_CONCURRENT_QUEUE_NAME = "explorer_low_concurrent_queue";

export default fp(async (app) => {
  const explorerHighConcurrentQueue = new Queue(EXPLORER_LOW_CONCURRENT_QUEUE_NAME, {
    connection: app.redis,
  });
  app.decorate('explorerLowConcurrentQueue', explorerHighConcurrentQueue);
}, {
  name: '@ossinsight/explorer-low-concurrent-queue',
  dependencies: [
    '@fastify/env',
    'fastify-redis',
  ]
});