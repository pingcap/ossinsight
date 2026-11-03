import fp from "fastify-plugin";
import fastifyRateLimit from '@fastify/rate-limit';
import {getRealClientIP} from "../utils/http/forwared";
import {consumePublicQuota} from '../utils/public-quota';

export default fp(async (app) => {
  app.addHook('onRequest', async (req, reply) => {
    if (req.method === 'OPTIONS' || !/^\/(?:q|queries|v1|gh|collections)(?:\/|$)/.test(req.routeOptions.url || '')) return;
    try {
      const budget = await consumePublicQuota(app.redis, getRealClientIP(req), app.config.PUBLIC_API_HOURLY_RATE_LIMIT);
      reply.header('X-RateLimit-Limit', budget.limit).header('X-RateLimit-Remaining', budget.remaining);
    } catch (error: any) {
      if (error.statusCode === 429) reply.header('Retry-After', error.payload.retryAfter);
      throw error;
    }
  });
  await app.register(fastifyRateLimit, {
    global: false,
    redis: app.redis,
    keyGenerator: getRealClientIP,
    // default show all the response headers when rate limit is not reached
    addHeadersOnExceeding: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': false
    },
    // default show all the response headers when rate limit is reached
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true
    },
  })
}, {
  name: '@ossinsight/rate-limit',
  dependencies: [
    '@fastify/env',
    '@ossinsight/redis'
  ],
});
