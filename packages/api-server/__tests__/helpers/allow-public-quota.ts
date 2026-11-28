import type {FastifyInstance} from 'fastify';
import fp from 'fastify-plugin';
import rateLimit from '../../src/plugins/rate-limit';

// Exercise the production admission hook with an available quota store.
export async function allowPublicQuota(app: FastifyInstance) {
  app.decorate('config', {PUBLIC_API_HOURLY_RATE_LIMIT: 100});
  app.decorate('redis', {defineCommand: jest.fn(), eval: jest.fn(async () => [1, 3600000])});
  await app.register(fp(async () => {}, {name: '@ossinsight/redis'}));
  await app.register(rateLimit);
}
