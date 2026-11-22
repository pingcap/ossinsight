jest.mock('../../../../apps/web/node_modules/@upstash/redis', () => ({Redis: jest.fn()}));
jest.mock('../../../../apps/web/node_modules/@upstash/ratelimit', () => {
  const limit = jest.fn();
  return {limitTestSpy: limit, Ratelimit: class {
    static slidingWindow = jest.fn();
    limit = limit;
  }};
});

import {proxy} from '../../../../apps/web/proxy';
const {NextRequest} = require('../../../../apps/web/node_modules/next/server');
const {limitTestSpy: limit} = require('../../../../apps/web/node_modules/@upstash/ratelimit');
const originalEnvironment = {...process.env};

beforeEach(() => {
  process.env.NODE_ENV = 'production';
  process.env.VERCEL = '1';
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'synthetic-test-only';
  limit.mockReset();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {process.env = {...originalEnvironment}; jest.restoreAllMocks();});

test.each(['/', '/llms-full.txt', '/sitemap.xml', '/trending?period=past_week',
  '/trending/ai?_rsc=navigation', '/languages/TypeScript?_rsc=navigation'])('quota rejection stops %s before page rendering', async path => {
  limit.mockResolvedValue({success: false, reset: Date.now() + 60000});
  const response = await proxy(new NextRequest('https://ossinsight.io' + path, {headers: {'x-forwarded-for': '192.0.2.7'}}));
  expect(limit).toHaveBeenCalledWith('192.0.2.7');
  expect(response.status).toBe(429);
  expect(response.headers.get('x-middleware-next')).toBeNull();
  expect(response.headers.get('Cache-Control')).toBe('no-store');
});

test.each(['timeout', 'rejected'])('quota backend %s cannot grant access to database-backed rendering', async mode => {
  if (mode === 'timeout') limit.mockResolvedValue({success: true, reason: 'timeout', reset: Date.now()});
  else limit.mockRejectedValue(new Error('Synthetic failure'));
  const response = await proxy(new NextRequest('https://ossinsight.io/'));
  expect(response.status).toBe(503);
  expect(response.headers.get('x-middleware-next')).toBeNull();
});

test('allowed page rendering retains nonce security and a bounded quota', async () => {
  limit.mockResolvedValue({success: true, limit: 600, remaining: 599, reset: Date.now() + 3600000});
  const response = await proxy(new NextRequest('https://ossinsight.io/trending'));
  expect(response.headers.get('x-middleware-next')).toBe('1');
  expect(response.headers.get('X-RateLimit-Limit')).toBe('600');
  expect(response.headers.get('Content-Security-Policy')).toContain("'strict-dynamic'");
});

test('CORS preflight and static content do not execute the database quota backend', async () => {
  for (const request of [new NextRequest('https://ossinsight.io/api/mcp', {method: 'OPTIONS'}),
    new NextRequest('https://ossinsight.io/seo-widgets-homepage.jpeg')]) {
    const response = await proxy(request);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  }
  expect(limit).not.toHaveBeenCalled();
});
