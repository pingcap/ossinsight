import {secureDatabaseURL} from '@ossinsight/types';
import {completeDatabaseURL} from '../utils/db';

export function workerConfig(env: NodeJS.ProcessEnv) {
  function integer(name: string, fallback: number, max: number) {
    const text = env[name] ?? String(fallback);
    if (!/^\d+$/.test(text) || +text < 1 || +text > max) throw new Error(`Invalid ${name}.`);
    return +text;
  }
  const high = integer('EXPLORER_HIGH_QUEUE_CONCURRENT', 4, 20);
  const low = integer('EXPLORER_LOW_QUEUE_CONCURRENT', 2, 10);
  const timeout = integer('EXPLORER_QUERY_SQL_TIMEOUT', 30000, 60000);
  function database(name: string) {
    const url = new URL(completeDatabaseURL(secureDatabaseURL(env[name] || '', true)));
    url.searchParams.set('connectionLimit', String(high + low + 2));
    url.searchParams.set('queueLimit', String(high + low + 2));
    url.searchParams.set('connectTimeout', '10000');
    url.searchParams.set('multipleStatements', 'false');
    return url.toString();
  }
  let redis: URL;
  try { redis = new URL(env.REDIS_URL || ''); } catch { throw new Error('Redis configuration required.'); }
  if (!['redis:', 'rediss:'].includes(redis.protocol) || !redis.hostname || !redis.password ||
      redis.search || redis.hash) throw new Error('Authenticated Redis configuration required.');
  // Never fall back from the analytics account to the metadata writer account.
  return {high, low, timeout, database: database('DATABASE_URL'),
    playground: database('PLAYGROUND_DATABASE_URL'), redis: redis.toString()};
}
