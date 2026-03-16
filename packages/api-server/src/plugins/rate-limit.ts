import fp from "fastify-plugin";
import fastifyRateLimit from '@fastify/rate-limit';
import {getRealClientIP} from "../utils/http/forwared";

export default fp(async (app) => {
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
