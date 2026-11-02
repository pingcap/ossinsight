import {createHash} from 'crypto';
import type Redis from 'ioredis';
import {APIError} from './error';

// One atomic counter across named-query HTTP aliases, /v1, metadata and sockets.
// The expiry is set in the same Redis operation as the first increment.
const CONSUME = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('PEXPIRE', KEYS[1], 3600000) end
return {count, redis.call('PTTL', KEYS[1])}
`;

export async function consumePublicQuota(redis: Pick<Redis, 'eval'>, identity: string, maximum: number) {
  if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 100000) throw new APIError(503, 'Request quota unavailable.');
  const digest = createHash('sha256').update(identity).digest('hex');
  const key = `ossinsight:${process.env.NODE_ENV || 'production'}:public-query-quota:${digest}`;
  let result: unknown;
  try { result = await redis.eval(CONSUME, 1, key); }
  catch { throw new APIError(503, 'Request quota unavailable.'); }
  if (!Array.isArray(result) || !Number.isSafeInteger(Number(result[0])) || Number(result[0]) < 1 ||
      !Number.isSafeInteger(Number(result[1])) || Number(result[1]) <= 0) {
    throw new APIError(503, 'Request quota unavailable.');
  }
  const count = Number(result[0]);
  const retryAfter = Math.ceil(Number(result[1]) / 1000);
  if (count > maximum) throw new APIError(429, 'Public query quota exceeded.', undefined, {retryAfter});
  return {limit: maximum, remaining: maximum - count, retryAfter};
}
