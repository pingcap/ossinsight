import {randomUUID} from 'crypto';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import pino from 'pino';
import Cache, {NeedPreFetchError} from '../../src/core/cache/Cache';
import {QueryRunner} from '../../src/core/runner/query/QueryRunner';
import * as quality from '../../src/utils/data-quality';
import {TiDBQueryExecutor} from '../../src/core/executor/query-executor/TiDBQueryExecutor';
import {TiDBPlaygroundQueryExecutor} from '../../src/core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import {ExplorerService} from '../../src/plugins/services/explorer-service';
import {tidbQueryCounter, tidbQueryHistogram, shadowTidbQueryCounter, shadowTidbQueryHistogram} from '../../src/metrics';
import {getPlaygroundQueryTimeout} from '../../src/core/playground/limitation';

const log = pino({enabled: false});
const catalog = resolve(__dirname, '../../../../configs/queries');
beforeEach(() => jest.spyOn(quality, 'getQueryDataQuality').mockReturnValue('ok'));
afterEach(() => jest.restoreAllMocks());

function queryFixture(name: string, rows: any[], columns: string[], overrides: Record<string, unknown> = {}) {
  const config = {...JSON.parse(readFileSync(`${catalog}/${name}/params.json`, 'utf8')), ...overrides};
  const sql = readFileSync(`${catalog}/${name}/template.sql`, 'utf8');
  const storage = new Map<string, string>();
  const provider = {get: jest.fn(async (key: string) => storage.has(key) ? JSON.parse(storage.get(key)!) : null),
    set: jest.fn(async (key: string, value: string) => {storage.set(key, value);})};
  const build = jest.fn((_provider, key, hours, only, refresh) => new Cache(log, provider, key, hours, only, refresh));
  const execute = jest.fn(async (_key, options) => [options.rowsAsArray ? rows.map(row => columns.map(col => row[col])) : rows,
    columns.map(name => ({name}))]);
  const metadata = {execute: jest.fn(async () => [[], []]), query: jest.fn().mockResolvedValue([[], []])};
  const runner = new QueryRunner(log, {build} as any, {load: async () => [config, sql]} as any, {execute} as any, metadata as any);
  return {runner, storage, provider, build, execute, metadata};
}

test('anonymous trending cache miss cannot execute or persist the heavy catalog query', async () => {
  const {runner, execute, metadata} = queryFixture('trending-repos', [], []);
  await expect(runner.query('trending-repos', {})).rejects.toBeInstanceOf(NeedPreFetchError);
  expect(execute).not.toHaveBeenCalled();
  expect(metadata.query).not.toHaveBeenCalled();
});

test.each([false, true])('prefetched trending stays cached while collection names are refreshed (array=%s)', async array => {
  const rows = [{repo_id: 42, repo_name: 'example/repo', collection_names: 'old-private-name', stars: 3}];
  const cols = Object.keys(rows[0]);
  const {runner, execute, metadata, storage} = queryFixture('trending-repos', rows, cols);
  const params = array ? {format: 'array'} : {};
  metadata.execute.mockResolvedValue([[{repo_id: 42, collection_names: 'public-name'}], []] as any);
  await runner.query('trending-repos', params, {ignoreOnlyFromCache: true, refreshCache: true});
  expect(storage.size).toBe(1);
  const first = await runner.query('trending-repos', params);
  expect(first.data[0][array ? 2 : 'collection_names']).toBe('public-name');
  metadata.execute.mockResolvedValue([[], []]);
  const second = await runner.query('trending-repos', params);
  expect(second.data[0][array ? 2 : 'collection_names']).toBeNull();
  expect(execute).toHaveBeenCalledTimes(1);
  expect(metadata.query).toHaveBeenCalledTimes(1);
  expect(metadata.query.mock.calls[0][1][0][0][3]).toBe('42');
  expect(JSON.stringify(second)).not.toContain('old-private-name');
  // Response projection must not mutate cached rankings or their raw input rows.
  expect(rows[0].collection_names).toBe('old-private-name');
});

test.each([false, true])('repository collection cache rechecks current membership and visibility (array=%s)', async array => {
  const {runner, execute, metadata, storage} = queryFixture('get-repo-collections', [{id: 1, name: 'old-name'}, {id: 2, name: 'private-name'}], ['id', 'name']);
  metadata.execute.mockResolvedValue([[{id: 1, name: 'new-name'}], []] as any);
  const params = {repoId: '42', ...(array ? {format: 'array'} : {})};
  const first = await runner.query('get-repo-collections', params);
  expect(first.data).toEqual(array ? [[1, 'new-name']] : [{id: 1, name: 'new-name'}]);
  metadata.execute.mockResolvedValue([[], []]);
  expect((await runner.query('get-repo-collections', params)).data).toEqual([]);
  expect(execute).toHaveBeenCalledTimes(1);
  expect(storage.size).toBe(1);
  expect(metadata.execute.mock.calls[0]).toEqual([expect.objectContaining({sql: expect.stringMatching(/ci\.deleted_at IS NULL/), timeout: 5000}), expect.arrayContaining([42, 1, 2])]);
});

test.each([false, true])('cached collection rankings discard revoked or removed memberships (array=%s)', async array => {
  const rows = [{id: 1, name: 'old-name', repo_id: 42, repo_name: 'old/repo', visits: 8},
    {id: 2, name: 'private-name', repo_id: 43, repo_name: 'private/repo', visits: 7}];
  const {runner, execute, metadata} = queryFixture('recent-hot-collections', rows, Object.keys(rows[0]));
  metadata.execute.mockResolvedValue([[{id: 1, name: 'new-name', repo_id: 42, repo_name: 'new/repo'}], []] as any);
  const params = array ? {format: 'array'} : {};
  const first = await runner.query('recent-hot-collections', params);
  expect(first.data).toEqual(array ? [[1, 'new-name', 42, 'new/repo', 8]] : [{...rows[0], name: 'new-name', repo_name: 'new/repo'}]);
  metadata.execute.mockResolvedValue([[], []]);
  expect((await runner.query('recent-hot-collections', params)).data).toEqual([]);
  expect(execute).toHaveBeenCalledTimes(1);
});

test('visibility lookup errors do not fall back to cached collection details', async () => {
  const {runner, metadata} = queryFixture('get-repo-collections', [{id: 1, name: 'secret'}], ['id', 'name']);
  metadata.execute.mockRejectedValue(new Error('metadata unavailable'));
  await expect(runner.query('get-repo-collections', {repoId: 42})).rejects.toThrow();
});

test('cache disabled cannot override a prefetch-only execution restriction', async () => {
  const provider = {get: jest.fn(async () => null), set: jest.fn()};
  const fallback = jest.fn();
  await expect(new Cache(log, provider, 'disabled-only-cache', 0, true).load(fallback)).rejects.toBeInstanceOf(NeedPreFetchError);
  expect(fallback).not.toHaveBeenCalled();
});

test('data quality gate still blocks affected rankings before cache or SQL access', async () => {
  jest.mocked(quality.getQueryDataQuality).mockReturnValue('blocked');
  const {runner, execute, build, metadata} = queryFixture('trending-repos', [], []);
  await expect(runner.query('trending-repos', {})).rejects.toMatchObject({statusCode: 503});
  expect(build).not.toHaveBeenCalled();
  expect(execute).not.toHaveBeenCalled();
  expect(metadata.execute).not.toHaveBeenCalled();
});

function connection() {
  const conn = {connection: {}, execute: jest.fn(async () => [[{value: 1}], [{name: 'value', columnType: 3}]]),
    query: jest.fn(async () => [[{connectionId: '1'}], []]), release: jest.fn(), destroy: jest.fn()};
  const pool = {getConnection: jest.fn(async () => conn)};
  return {conn, pool};
}

test('playground default applies server and client deadlines without environment configuration', async () => {
  const {conn, pool} = connection();
  const executor = new TiDBPlaygroundQueryExecutor(pool as any, null, log);
  await executor.execute('playground-sql', 'SELECT 1');
  const statements = conn.execute.mock.calls.map((args: any[]) => typeof args[0] === 'string' ? args[0] : args[0].sql);
  expect(statements).toContain('SET SESSION max_execution_time = 30000');
  expect(conn.execute).toHaveBeenLastCalledWith(expect.objectContaining({sql: expect.stringMatching(/^SELECT/), timeout: 30000}));
});

test.each([0, -1, 600000, Number.POSITIVE_INFINITY])('caller timeout %s cannot disable or extend the playground deadline', async timeout => {
  const {conn, pool} = connection();
  await new TiDBPlaygroundQueryExecutor(pool as any, null, log).executeWithConn(conn as any, 'playground-sql', {sql: 'SELECT 1', timeout});
  expect(conn.execute).toHaveBeenLastCalledWith(expect.objectContaining({timeout: 30000}));
});

test('shorter per-query budgets apply to server and client and optimizer hints cannot increase them', async () => {
  const {conn, pool} = connection();
  await new TiDBPlaygroundQueryExecutor(pool as any, null, log).executeWithConn(conn as any, 'playground-sql', {
    sql: 'SELECT /*+ MAX_EXECUTION_TIME(0) SET_VAR(max_execution_time=0) */ 1', timeout: 1000});
  expect(conn.execute).toHaveBeenLastCalledWith(expect.objectContaining({timeout: 1000}));
  const calls = conn.execute.mock.calls as any[][];
  expect(calls.some(([input]) => (typeof input === 'string' ? input : input.sql) === 'SET SESSION max_execution_time = 1000')).toBe(true);
  expect(calls.at(-1)![0].sql).not.toMatch(/MAX_EXECUTION_TIME|SET_VAR/i);
});

test('timed-out playground connections are destroyed and never returned while still executing', async () => {
  const {conn, pool} = connection();
  conn.execute.mockImplementation(async (input?: any) => {
    if ((typeof input === 'string' ? input : input.sql).startsWith('SET ')) return [[], []];
    throw Object.assign(new Error('timeout'), {code: 'PROTOCOL_SEQUENCE_TIMEOUT'});
  });
  await expect(new TiDBPlaygroundQueryExecutor(pool as any, null, log).execute('playground-sql', 'SELECT 1')).rejects.toMatchObject({code: 'PROTOCOL_SEQUENCE_TIMEOUT'});
  expect(conn.destroy).toHaveBeenCalledTimes(1);
  expect(conn.destroy.mock.invocationCallOrder[0]).toBeLessThan(conn.release.mock.invocationCallOrder[0]);
});

test.each([false, true])('executor retains its pooled connection until statement settles (reject=%s)', async reject => {
  const {conn, pool} = connection();
  let finish!: () => void;
  let started!: () => void;
  const running = new Promise<void>(resolve => {started = resolve;});
  conn.execute.mockImplementation(() => new Promise((resolve, fail) => {
    finish = () => reject ? fail(new Error('query failed')) : resolve([[], []]); started();
  }));
  const result = new TiDBQueryExecutor(pool as any, null, log).execute('bounded-query', 'SELECT 1');
  const completed = result.then(() => undefined, () => undefined);
  await running;
  const releasedEarly = conn.release.mock.calls.length;
  finish(); await completed;
  expect(releasedEarly).toBe(0);
  expect(conn.release).toHaveBeenCalledTimes(1);
});

test('many Explorer question identities share bounded primary and shadow metric series', async () => {
  for (const metric of [tidbQueryCounter, tidbQueryHistogram, shadowTidbQueryCounter, shadowTidbQueryHistogram]) metric.reset();
  const primary = connection(); const shadow = connection();
  const executor = new TiDBPlaygroundQueryExecutor(primary.pool as any, shadow.pool as any, log);
  const service = new ExplorerService(log, {} as any, {} as any, executor, {} as any, {} as any);
  jest.spyOn(service as any, 'markQuestionRunning').mockResolvedValue(undefined);
  for (let i = 0; i < 50; i++) await (service as any).executeQuery(randomUUID(), 'SELECT 1');
  await new Promise(resolve => setImmediate(resolve));
  for (const metric of [tidbQueryCounter, tidbQueryHistogram, shadowTidbQueryCounter, shadowTidbQueryHistogram]) {
    expect(new Set((await metric.get()).values.map(value => value.labels.query))).toEqual(new Set(['explorer-sql']));
  }
  expect((await tidbQueryCounter.get()).values.find(value => value.labels.phase === 'success')?.value).toBe(50);
});

test.each(['0', '-1', '60001', 'NaN', '1e3', '1; SELECT 1'])('invalid configured timeout %s fails closed', raw => {
  const prior = process.env.PLAYGROUND_QUERY_SQL_TIMEOUT;
  process.env.PLAYGROUND_QUERY_SQL_TIMEOUT = raw;
  try {expect(() => getPlaygroundQueryTimeout()).toThrow();}
  finally {if (prior === undefined) delete process.env.PLAYGROUND_QUERY_SQL_TIMEOUT; else process.env.PLAYGROUND_QUERY_SQL_TIMEOUT = prior;}
});

test('worker-specific deadlines still apply to direct and shadow executions', async () => {
  const primary = connection(); const shadow = connection();
  const executor = new TiDBPlaygroundQueryExecutor(primary.pool as any, shadow.pool as any, log, [], 60000);
  await executor.execute('playground-sql', 'SELECT 1');
  await new Promise(resolve => setImmediate(resolve));
  for (const {conn} of [primary, shadow]) {
    expect(conn.execute).toHaveBeenLastCalledWith(expect.objectContaining({timeout: 60000}));
    expect(conn.execute.mock.calls.some(([input]: any[]) => (typeof input === 'string' ? input : input.sql) === 'SET SESSION max_execution_time = 60000')).toBe(true);
  }
});
