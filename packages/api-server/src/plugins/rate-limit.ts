import fp from "fastify-plugin";
import fastifyRateLimit from '@fastify/rate-limit';
import {getRealClientIP} from "../utils/http/forwared";
import {consumePublicQuota} from '../utils/public-quota';
import {createOperatorAuthenticator, operationsCredentials} from '../utils/http/operator-auth';

export default fp(async (app) => {
  const authenticate = createOperatorAuthenticator(operationsCredentials(app.config));
  app.addHook('onRequest', async (req, reply) => {
    if (req.method === 'OPTIONS') return;
    // Default to metering every route, including future routes and 404s. Only
    // authenticated monitoring traffic may avoid the shared public budget.
    if (req.routeOptions.config.operatorOnly === true) {
      authenticate(req.headers.authorization);
      return;
    }
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
  });
  // fastify-cli registers the application in a child scope. Without a local
  // 404 handler, unmatched URLs use the parent CLI scope and skip this quota
  // and the application's audit hooks entirely.
  app.setNotFoundHandler(async (_request, reply) => reply.code(404).send({message: 'Not found.'}));
}, {
  name: '@ossinsight/rate-limit',
  dependencies: [
    '@fastify/env',
    '@ossinsight/redis'
  ],
});
