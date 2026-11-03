import Fastify from 'fastify';
import fp from 'fastify-plugin';
import path from 'path';
import pino from 'pino';
import cors, {getAllowedOrigins, isAllowedSocketOrigin} from '../../src/plugins/cors';
import rateLimit from '../../src/plugins/rate-limit';
import {getSocketClientIP} from '../../src/utils/http/forwared';
import {consumePublicQuota} from '../../src/utils/public-quota';
import {socketServerRoutes, validateSocketQuery} from '../../src/plugins/socket.io';
import {errorHandler} from '../../src/utils/http/error-handler';
import {APIError} from '../../src/utils/error';

const configs = path.resolve(__dirname, '../../../../configs');
const log = pino({level: 'silent'});

async function baseApp(config: Record<string, unknown>) {
  const app = Fastify();
  app.decorate('config', config);
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  app.setErrorHandler(errorHandler);
  return app;
}

test('public consumers cannot inherit credentialed CORS access', async () => {
  const app = await baseApp({CONFIGS_PATH: configs});
  await app.register(cors);
  app.get('/q/public', () => ({ok: true}));
  app.get('/private', () => ({ok: true}));
  try {
    const privateResponse = await app.inject({url: '/private', headers: {origin: 'https://ossinsight.io'}});
    expect(privateResponse.headers['access-control-allow-credentials']).toBe('true');
    expect(privateResponse.headers['access-control-allow-origin']).toBe('https://ossinsight.io');
    for (const origin of ['https://github.com', 'https://pingcap-ossinsight-preview-pr-evil.surge.sh', 'https://evil.preview.app.github.dev']) {
      const response = await app.inject({url: '/private', headers: {origin}});
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
      expect(response.headers['access-control-allow-credentials']).toBeUndefined();
    }
    const publicResponse = await app.inject({url: '/q/public', headers: {origin: 'https://github.com'}});
    expect(publicResponse.headers['access-control-allow-origin']).toBe('https://github.com');
    expect(publicResponse.headers['access-control-allow-credentials']).toBeUndefined();
    const preflight = await app.inject({method: 'OPTIONS', url: '/q/public', headers: {origin: 'https://github.com', 'access-control-request-method': 'GET'}});
    expect(preflight.headers['access-control-allow-origin']).toBe('https://github.com');
  } finally { await app.close(); }
});

test('socket origins are explicit and localhost is not a production credential origin', () => {
  const allowed = getAllowedOrigins(configs, true);
  for (const origin of [undefined, '', 'null', 'http://localhost:3001', 'https://arbitrary.vercel.app']) {
    expect(isAllowedSocketOrigin(origin, allowed)).toBe(false);
  }
  expect(isAllowedSocketOrigin('https://ossinsight.io', allowed)).toBe(true);
});

test('sockets trust the same explicitly configured proxy boundary as HTTP', () => {
  const previous = process.env.TRUSTED_PROXY_CIDRS;
  const req = {headers: {'x-forwarded-for': '203.0.113.4'}, socket: {remoteAddress: '192.0.2.10'}} as any;
  try {
    delete process.env.TRUSTED_PROXY_CIDRS;
    expect(getSocketClientIP(req)).toBe('192.0.2.10');
    process.env.TRUSTED_PROXY_CIDRS = '192.0.2.0/24';
    expect(getSocketClientIP(req)).toBe('203.0.113.4');
    process.env.TRUSTED_PROXY_CIDRS = '198.51.100.0/24';
    expect(getSocketClientIP(req)).toBe('192.0.2.10');
  } finally {
    if (previous === undefined) delete process.env.TRUSTED_PROXY_CIDRS;
    else process.env.TRUSTED_PROXY_CIDRS = previous;
  }
});

test('HTTP query, metadata and proxy aliases consume one shared identity budget', async () => {
  const app = await baseApp({PUBLIC_API_HOURLY_RATE_LIMIT: 2});
  let count = 0;
  const evalCommand = jest.fn(async () => [++count, 3600000]);
  app.decorate('redis', {eval: evalCommand, defineCommand: jest.fn()});
  await app.register(fp(async () => {}, {name: '@ossinsight/redis'}));
  await app.register(rateLimit);
  for (const route of ['/q/one', '/queries/two', '/v1/three']) app.get(route, () => ({ok: true}));
  try {
    for (const [index, url] of ['/q/one', '/queries/two', '/v1/three'].entries()) {
      const response = await app.inject({url, remoteAddress: '192.0.2.1', headers: {'x-forwarded-for': `203.0.113.${index}`}});
      expect(response.statusCode).toBe(index < 2 ? 200 : 429);
      if (index === 2) expect(response.headers['retry-after']).toBe('3600');
    }
    expect(new Set(evalCommand.mock.calls.map((call: any[]) => call[2])).size).toBe(1);
  } finally { await app.close(); }
});

test('Redis failures and invalid replies never grant a query budget', async () => {
  await expect(consumePublicQuota({eval: jest.fn().mockRejectedValue(new Error('private redis URL'))} as any, 'ip', 10)).rejects.toMatchObject({statusCode: 503});
  await expect(consumePublicQuota({eval: jest.fn().mockResolvedValue([1, 'broken'])} as any, 'ip', 10)).rejects.toMatchObject({statusCode: 503});
});

test.each([null, [], 'query', {query: '../private'}, {query: 'ok', explain: 'yes'}, {query: 'ok', params: []}, {query: 'ok', qid: 'x'.repeat(81)}])('malformed socket request cannot execute %s', request => {
  expect(() => validateSocketQuery(request)).toThrow();
});

function socketHarness(runner: any, consume = jest.fn().mockResolvedValue(undefined)) {
  const handlers: Record<string, (...args: any[]) => Promise<void>> = {};
  const socket = {on: jest.fn((name, callback) => {handlers[name] = callback;}), emit: jest.fn()};
  socketServerRoutes(log, socket as any, runner, consume);
  return {socket, request: handlers.q, consume};
}

test('WebSocket responses never serialize SQL errors or echo the original request', async () => {
  const query = jest.fn().mockRejectedValue(new Error('password=private SELECT * FROM private_table'));
  const {socket, request, consume} = socketHarness({query});
  await request({query: 'public-query', params: {}, qid: 'test'});
  expect(consume).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(socket.emit.mock.calls)).not.toMatch(/password|private_table/);
  expect(socket.emit).toHaveBeenCalledWith('/q/public-query?qid=test', expect.objectContaining({error: true, payload: expect.objectContaining({statusCode: 500})}));
});

test('socket concurrency is bounded before expensive query execution', async () => {
  let finish!: (value: unknown) => void;
  const pending = new Promise(resolve => {finish = resolve;});
  const query = jest.fn(() => pending);
  const {socket, request, consume} = socketHarness({query});
  const first = request({query: 'public-query'});
  const second = request({query: 'public-query'});
  await Promise.resolve();
  await request({query: 'public-query'});
  expect(query).toHaveBeenCalledTimes(2);
  expect(consume).toHaveBeenCalledTimes(2);
  expect(socket.emit).toHaveBeenCalledWith('fatal-error/q', expect.objectContaining({error: expect.objectContaining({statusCode: 429})}));
  finish({data: [], fields: []});
  await Promise.all([first, second]);
});

test('an exhausted shared budget prevents socket SQL execution', async () => {
  const query = jest.fn();
  const consume = jest.fn().mockRejectedValue(new APIError(429, 'quota', undefined, {retryAfter: 60}));
  const {request} = socketHarness({query}, consume);
  await request({query: 'public-query'});
  await request({query: 'public-query'});
  expect(query).not.toHaveBeenCalled();
  expect(consume).toHaveBeenCalledTimes(1);
});
