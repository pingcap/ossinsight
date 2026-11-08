import Fastify from 'fastify';
import fp from 'fastify-plugin';
import urlData from '@fastify/url-data';
import pino from 'pino';
import rateLimit from '../../src/plugins/rate-limit';
import healthy from '../../src/routes/healthy';
import recorder from '../../src/plugins/stats/api-request-recorder';
import {BatchLoader} from '../../src/core/db/batch-loader';
import {cachedHealth} from '../../src/utils/http/cached-health';
import {boundedAuditText} from '../../src/plugins/stats/api-request-recorder';
import {registerOperatorRoutes} from '../../src/utils/http/operator-routes';

async function quotaApp(limit = 2, token?: string) {
  const app = Fastify();
  const counts = new Map<string, number>();
  const redis = {defineCommand: jest.fn(), eval: jest.fn(async (_script, _keys, key) => {
    const count = (counts.get(key) || 0) + 1; counts.set(key, count); return [count, 3600000];
  })};
  app.decorate('config', {PUBLIC_API_HOURLY_RATE_LIMIT: limit, OPERATIONS_TOKEN: token});
  app.decorate('redis', redis);
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  await app.register(fp(async () => {}, {name: '@ossinsight/redis'}));
  await app.register(rateLimit);
  return {app, redis};
}

test('new public routes, health, Explorer and query aliases share one quota', async () => {
  const {app} = await quotaApp();
  const action = jest.fn(async () => ({ok: true}));
  for (const path of ['/healthy', '/explorer/questions/recommend', '/q/example', '/future-route']) app.get(path, action);
  try {
    expect((await app.inject('/healthy')).statusCode).toBe(200);
    expect((await app.inject('/explorer/questions/recommend')).statusCode).toBe(200);
    for (const path of ['/q/example', '/future-route', '/not-registered']) {
      const response = await app.inject(path);
      expect(response.statusCode).toBe(429);
      expect(response.headers['retry-after']).toBe('3600');
    }
    expect(action).toHaveBeenCalledTimes(2);
  } finally {await app.close();}
});

test('unmatched routes inside Fastify CLI encapsulation retain quota and audit hooks', async () => {
  const app = Fastify();
  let count = 0;
  await app.register(async child => {
    child.decorate('config', {PUBLIC_API_HOURLY_RATE_LIMIT: 1});
    child.decorate('redis', {defineCommand: jest.fn(), eval: jest.fn(async () => [++count, 3600000])});
    await child.register(fp(async () => {}, {name: '@fastify/env'}));
    await child.register(fp(async () => {}, {name: '@ossinsight/redis'}));
    child.addHook('onSend', async (_request, reply, payload) => {reply.header('X-Audit-Hook', 'ran');return payload;});
    await child.register(rateLimit);
    child.get('/registered', async () => 'ok');
  });
  try {
    const first = await app.inject('/missing-one');
    expect(first.statusCode).toBe(404);
    expect(first.headers['x-ratelimit-limit']).toBe('1');
    expect(first.headers['x-audit-hook']).toBe('ran');
    expect((await app.inject('/missing-two')).statusCode).toBe(429);
    expect((await app.inject('/registered')).statusCode).toBe(429);
  } finally {await app.close();}
});

test('feedback writes cannot bypass exhausted quota, and Redis failure prevents work', async () => {
  const {app, redis} = await quotaApp(1);
  const write = jest.fn(async () => ({ok: true}));
  app.post('/explorer/questions/:id/feedback', write);
  app.get('/healthy', write);
  try {
    expect((await app.inject({method: 'POST', url: '/explorer/questions/one/feedback'})).statusCode).toBe(200);
    expect((await app.inject({method: 'POST', url: '/explorer/questions/two/feedback'})).statusCode).toBe(429);
    redis.eval.mockRejectedValueOnce(new Error('private Redis details'));
    const response = await app.inject('/healthy');
    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain('private Redis');
    expect(write).toHaveBeenCalledTimes(1);
  } finally {await app.close();}
});

test('concurrent health requests coalesce backend probes and reuse a short cache', async () => {
  const app = Fastify();
  const mysql = {query: jest.fn(async () => [[{ok: 1}]]), shadow: {query: jest.fn(async () => [[{ok: 1}]])}};
  const redis = {ping: jest.fn(async () => 'PONG')};
  app.decorate('mysql', mysql);app.decorate('redis', redis);
  await app.register(healthy, {prefix: '/healthy'});
  try {
    const responses = await Promise.all(Array.from({length: 50}, () => app.inject('/healthy')));
    expect(responses.every(response => response.statusCode === 200 && response.json().healthy)).toBe(true);
    expect(mysql.query).toHaveBeenCalledTimes(1);
    expect(mysql.shadow.query).toHaveBeenCalledTimes(1);
    expect(redis.ping).toHaveBeenCalledTimes(1);
    await app.inject('/healthy');
    expect(mysql.query).toHaveBeenCalledTimes(1);
  } finally {await app.close();}
});

test('oversized UTF-8 origin/path cannot poison audit rows; failures are recorded once with final status', async () => {
  const app = Fastify();
  const inserts: any[][] = [];
  app.decorate('mysql', {query: jest.fn(async (_sql, rows) => {inserts.push(...rows[0]);return [{affectedRows: rows[0].length}];})});
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  await app.register(fp(async () => {}, {name: '@ossinsight/tidb'}));
  await app.register(urlData);
  await app.register(recorder);
  app.get('/failure', async () => {throw new Error('private error');});
  try {
    await app.inject({url: '/' + 'long-path'.repeat(100), headers: {origin: 'https://' + '界'.repeat(300)}});
    await app.inject('/failure');
    await app.apiRequestRecorder.flush();
    expect(inserts).toHaveLength(2);
    for (const row of inserts) {
      expect(Buffer.byteLength(row[1], 'utf8')).toBeLessThanOrEqual(255);
      expect(Buffer.byteLength(row[3], 'utf8')).toBeLessThanOrEqual(255);
    }
    const failed = inserts.find(row => row[3] === '/failure');
    expect(failed[5]).toBe(true);
    expect(failed[6]).toBe(500);
  } finally {await app.close();}
});

test('one deterministic bad row cannot discard the other 99 audit records or print their contents', async () => {
  const accepted: number[] = [], messages: string[] = [];
  const logger = pino({level: 'error'}, {write: message => {messages.push(message);}});
  const query = jest.fn(async (_sql, [records]) => {
    if (records.some(record => record[0] === 42)) throw Object.assign(new Error('private-row-content'), {errno: 1406, sql: 'private-row-content'});
    accepted.push(...records.map(record => record[0]));return [{affectedRows: records.length}];
  });
  const loader = new BatchLoader(logger, {query} as any, 'INSERT INTO audit VALUES ?', {batchSize: 100, flushInterval: -1});
  for (let id = 0; id < 100; id++) await loader.insert([id]);
  await loader.destroy();
  expect(accepted).toEqual(Array.from({length: 100}, (_, id) => id).filter(id => id !== 42));
  expect(query.mock.calls.length).toBeLessThan(20);
  expect(messages.join('')).not.toContain('private-row-content');
});

test('connection failures retry a batch without splitting it into a storm of inserts', async () => {
  const query = jest.fn().mockRejectedValue(Object.assign(new Error('private connection'), {code: 'ECONNRESET'}));
  const loader = new BatchLoader(pino({enabled: false}), {query} as any, 'INSERT INTO audit VALUES ?', {batchSize: 100, flushInterval: -1});
  for (let id = 0; id < 100; id++) await loader.insert([id]);
  await loader.destroy();
  expect(query).toHaveBeenCalledTimes(3);
  expect(query.mock.calls.every(call => call[1][0].length === 100)).toBe(true);
});

test('authenticated scrapes remain available after public quota exhaustion, while forged credentials fail', async () => {
  const secret = 'test-only-monitor-token-'.repeat(3);
  const {app, redis} = await quotaApp(1, secret);
  app.get('/public', async () => 'ok');
  app.options('/public', async (_request, reply) => reply.code(204).send());
  await registerOperatorRoutes(app, secret, async operations => {
    operations.get('/metrics', async () => 'metrics');
    operations.get('/docs/json', async () => ({}));
  });
  try {
    expect((await app.inject('/public')).statusCode).toBe(200);
    expect((await app.inject('/public')).statusCode).toBe(429);
    for (const url of ['/metrics', '/docs/json']) {
      expect((await app.inject({url, headers: {authorization: `Bearer ${secret}`}})).statusCode).toBe(200);
      expect((await app.inject({url, headers: {authorization: 'Bearer forged'}})).statusCode).toBe(401);
      expect((await app.inject(url)).statusCode).toBe(401);
    }
    expect((await app.inject({method: 'OPTIONS', url: '/public'})).statusCode).toBe(204);
    expect(redis.eval).toHaveBeenCalledTimes(2);
  } finally {await app.close();}
});

test('health deadlines do not create more backend probes while a dependency stays stuck', async () => {
  jest.useFakeTimers();
  let finish!: (result: {healthy: boolean}) => void;
  const probe = jest.fn(() => new Promise<{healthy: boolean}>(resolve => {finish = resolve;}));
  const check = cachedHealth(probe, 100, 20);
  try {
    const first = check();await jest.advanceTimersByTimeAsync(20);
    expect(await first).toEqual({healthy: false});
    await jest.advanceTimersByTimeAsync(101);
    const second = check();await jest.advanceTimersByTimeAsync(20);
    expect(await second).toEqual({healthy: false});
    expect(probe).toHaveBeenCalledTimes(1);
    finish({healthy: true});await jest.advanceTimersByTimeAsync(101);
    probe.mockResolvedValueOnce({healthy: true});
    expect(await check()).toEqual({healthy: true});
    expect(probe).toHaveBeenCalledTimes(2);
  } finally {jest.useRealTimers();}
});

test('expired health successes cannot hide a subsequent dependency failure', async () => {
  jest.useFakeTimers();
  const probe = jest.fn().mockResolvedValueOnce({healthy: true}).mockRejectedValueOnce(new Error('private connection'));
  const check = cachedHealth(probe, 100, 20);
  try {
    expect(await check()).toEqual({healthy: true});
    await jest.advanceTimersByTimeAsync(101);
    expect(await check()).toEqual({healthy: false});
    expect(probe).toHaveBeenCalledTimes(2);
  } finally {jest.useRealTimers();}
});

test('byte-bounded audit text never splits multibyte characters', () => {
  expect(boundedAuditText('a'.repeat(253) + '界', 255)).toBe('a'.repeat(253));
  expect(boundedAuditText('界'.repeat(100), 255)).toBe('界'.repeat(85));
  expect(boundedAuditText('😀'.repeat(100), 255)).toBe('😀'.repeat(63));
});

test('shutdown waits for an insert-triggered flush as well as timer-triggered writes', async () => {
  let finish!: () => void;
  const query = jest.fn(() => new Promise<void>(resolve => {finish = resolve;}));
  const loader = new BatchLoader(pino({enabled: false}), {query} as any, 'INSERT INTO audit VALUES ?', {batchSize: 1, flushInterval: -1});
  const inserting = loader.insert(['fixture']);
  let closed = false;
  const closing = loader.destroy().then(() => {closed = true;});
  await Promise.resolve();await Promise.resolve();
  expect(closed).toBe(false);
  finish();await inserting;await closing;
  expect(closed).toBe(true);
});
