import type {FastifyInstance} from 'fastify';
import fp from 'fastify-plugin';
import rateLimit from '../../src/plugins/rate-limit';

// Exercise the production admission hook with an available quota store.
export async function allowPublicQuota(app: FastifyInstance) {
  const config = {PUBLIC_API_HOURLY_RATE_LIMIT: 100} satisfies Pick<FastifyInstance['config'], 'PUBLIC_API_HOURLY_RATE_LIMIT'>;
  const redis = {defineCommand: jest.fn(), eval: jest.fn(async () => [1, 3600000])};
  app.decorate<typeof config>('config', config);
  app.decorate<typeof redis>('redis', redis);
  await app.register(fp(async () => {}, {name: '@ossinsight/redis'}));
  await app.register(rateLimit);
}
