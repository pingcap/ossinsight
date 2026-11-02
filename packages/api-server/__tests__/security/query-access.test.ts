import Fastify from 'fastify';
import pino from 'pino';
import {isPublicQuery, validateQueryName} from '@ossinsight/types';
import {QueryRunner} from '../../src/core/runner/query/QueryRunner';
import {QueryLoader} from '../../src/core/runner/query/QueryLoader';
import {getRealClientIP} from '../../src/utils/http/forwared';
import {errorHandler} from '../../src/utils/http/error-handler';
import {publicDataServiceTarget} from '../../src/utils/endpoint';
import {getPublicApiDataQuality} from '../../src/utils/data-quality';
import fallback from '../../src/routes/v1';

const logger = pino({level: 'silent'});

describe('named query authorization', () => {
  test.each(['../stats-table-ddl', 'foo/../stats-table-ddl', '%2e%2e/stats-table-ddl', 'a\\b', 'a//b', '/a', 'a/', 'a'.repeat(251)])('rejects noncanonical name %s before loading', async name => {
    expect(() => validateQueryName(name)).toThrow();
    const loader = new QueryLoader(logger, '/nonexistent');
    await expect(loader.load(name)).rejects.toMatchObject({statusCode: 400});
  });

  test('retains reviewed public analytics and defaults new/internal queries to private', () => {
    expect(isPublicQuery('analyze-recent-stars', {})).toBe(true);
    expect(isPublicQuery('analyze-recent-stars', {public: false})).toBe(false);
    expect(isPublicQuery('new-query', {})).toBe(false);
    expect(isPublicQuery('new-query', {public: true})).toBe(true);
    for (const name of ['stats-table-ddl', 'stats-table-info', 'stats-query-records', 'stats-indexes-info']) {
      expect(isPublicQuery(name, {})).toBe(false);
    }
  });

  test.each(['query', 'explain'] as const)('%s denies private queries before cache or execution', async method => {
    const build = jest.fn();
    const load = jest.fn().mockResolvedValue([{public: false}, 'SHOW CREATE TABLE github_events']);
    const runner = new QueryRunner(logger, {build} as any, {load} as any, {} as any, {} as any);
    await expect(runner[method]('stats-table-ddl', {})).rejects.toMatchObject({statusCode: 404});
    expect(build).not.toHaveBeenCalled();
  });
});

describe('public API proxy', () => {
  const template = '/v1/repos/:owner/:repo/stargazers/history/';
  test('uses registered route, encodes query keys and gives route identities precedence', () => {
    const result = publicDataServiceTarget(template, {'x&private': 'value', owner: 'attacker'}, {owner: 'pingcap', repo: 'tidb'});
    const url = new URL(result, 'https://example.com');
    expect(url.pathname).toBe('/repos/stargazers/history');
    expect(url.searchParams.getAll('owner')).toEqual(['pingcap']);
    expect(url.searchParams.get('x&private')).toBe('value');
    expect(url.searchParams.has('private')).toBe(false);
  });
  test.each(['..', '.', '%2e%2e', 'a/b', 'a\\b', 'a?b', 'a#b'])('rejects traversal-like path value %s', value => {
    expect(() => publicDataServiceTarget(template, {}, {owner: value})).toThrow();
  });
  test('unknown routes never reach credentialed Data Service', async () => {
    const app = Fastify();
    const request = jest.fn();
    app.decorate('tidbDataService', {request});
    await app.register(fallback, {prefix: '/v1'});
    try {
      expect((await app.inject('/v1/internal/admin')).statusCode).toBe(404);
      expect(request).not.toHaveBeenCalled();
    } finally { await app.close(); }
  });
  test.each(['issue_creators', 'pull_request_creators'])('%s statistics receive the incident marker', route => {
    for (const suffix of ['history', 'countries', 'organizations']) {
      expect(getPublicApiDataQuality(`/repos/${route}/${suffix}`)).toBe('tainted');
    }
  });
});

test('forged forwarding headers cannot select the rate-limit identity', async () => {
  const app = Fastify();
  app.get('/', req => ({ip: getRealClientIP(req)}));
  try {
    const response = await app.inject({url: '/', remoteAddress: '192.0.2.10', headers: {
      'x-real-ip': 'attacker', 'x-client-ip': 'attacker', 'x-forwarded-for': '203.0.113.10',
    }});
    expect(response.json()).toEqual({ip: '192.0.2.10'});
  } finally { await app.close(); }
});

test('only an explicitly trusted proxy can contribute the client address', async () => {
  const app = Fastify({trustProxy: ['192.0.2.0/24']});
  app.get('/', req => ({ip: getRealClientIP(req)}));
  try {
    const response = await app.inject({url: '/', remoteAddress: '192.0.2.10', headers: {
      'x-real-ip': 'attacker', 'x-forwarded-for': 'attacker, 203.0.113.10',
    }});
    expect(response.json()).toEqual({ip: '203.0.113.10'});
  } finally { await app.close(); }
});

test('unexpected failures never disclose internal SQL, credentials or causes', async () => {
  const app = Fastify();
  app.setErrorHandler(errorHandler);
  app.get('/', () => { throw new Error('password=private SELECT * FROM private_table'); });
  try {
    const response = await app.inject('/');
    expect(response.statusCode).toBe(500);
    expect(response.json().message).toBe('Internal Server Error');
    expect(response.body).not.toMatch(/password|private_table/);
  } finally { await app.close(); }
});
