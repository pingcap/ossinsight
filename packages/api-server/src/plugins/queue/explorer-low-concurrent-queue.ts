import fp from "fastify-plugin";
import {Queue} from "bullmq";

declare module 'fastify' {
  interface FastifyInstance {
    explorerLowConcurrentQueue: Queue;
  }
}

export default fp(async (app) => {
  const explorerHighConcurrentQueue = new Queue("explorer_low_concurrent_queue", {
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