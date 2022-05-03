import { Context } from 'koa'

const RateLimit = require('koa2-ratelimit').RateLimit;
const Stores = require('koa2-ratelimit').Stores;

export function createRateLimiter (prefix: string = 'global', options?: any) {
    const upperPrefix = prefix.replaceAll('-', '_').toUpperCase();
    const enableRateLimit = parseInt(process.env.ENABLE_RATE_LIMIT || '1') !== 0;
    const rateLimitInterval = parseInt(process.env[`${upperPrefix}_RATE_LIMIT_INTERVAL`] || '1');
    const rateLimitMaxRequests = parseInt(process.env[`${upperPrefix}_RATE_LIMIT_MAX_REQUEST`] || '60');
    const defaults = {
      interval: { min: rateLimitInterval },    // 1 minutes = 1 * 60 * 1000
      max: rateLimitMaxRequests,               // limit max requests per interval for each IP.
      store: new Stores.Redis({
        url: process.env.REDIS_URL
      }),
      keyGenerator: (ctx: Context) => {
        return `rate-limit:${prefix}:${ctx.request.ip}`;
      }
    };
    const skipAllRequest = () => true;

    console.log(`rate-limit:${prefix}:enable = ${enableRateLimit}`);
    
    return RateLimit.middleware(Object.assign(defaults, options, {
      skip: enableRateLimit ? options?.skip : skipAllRequest
    }));
}
