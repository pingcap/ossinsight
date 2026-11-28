import {setTimeout as delay} from 'node:timers/promises';
import {createPool, Pool} from 'mysql2/promise';
import pino from 'pino';
import CacheBuilder from '../../src/core/cache/CacheBuilder';
import {NeedPreFetchError} from '../../src/core/cache/Cache';
import {QueryRunner} from '../../src/core/runner/query/QueryRunner';
import {TiDBQueryExecutor} from '../../src/core/executor/query-executor/TiDBQueryExecutor';
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../helpers/db';

const log = pino({level: 'silent'});
let pool: Pool;
beforeAll(async () => {
  await bootstrapTestDatabase();
  pool = createPool({uri: getTestDatabase().url(), connectionLimit: 1});
});
afterAll(async () => {await pool?.end(); await releaseTestDatabase();});

function runner(caller: 'request' | 'prefetch', onlyFromCache = false, enabled = true) {
  const config = {public: true, cacheHours: 1, onlyFromCache,
    params: [{name: 'id', type: 'integer', default: 1, replaces: '${id}'}]};
  const sql = 'SELECT @@SESSION.max_execution_time AS budget, ${id} AS id';
  const loader = {load: async () => [config, sql]};
  return new QueryRunner(log, new CacheBuilder(log, enabled, pool), loader as any, new TiDBQueryExecutor(pool, null, log), pool, caller);
}

test('normal requests reuse bounded results without inserting parameter variants into TiDB', async () => {
  const api = runner('request');
  await pool.query('SET SESSION max_execution_time = 0');
  for (const id of [1, 2, 3]) {
    const result = await api.query<any[]>('budget-fixture', {id});
    expect(result.data).toEqual([{budget: 30000, id}]);
  }
  expect((await api.query('budget-fixture', {id: 1})).refresh).toBeUndefined();
  const [settings]: any = await pool.query('SELECT @@SESSION.max_execution_time AS previous');
  expect(Number(settings[0].previous)).toBe(0);
  const [counts]: any = await pool.query('SELECT COUNT(*) AS n FROM cached_table_cache');
  expect(Number(counts[0].n)).toBe(0);
});

test('a stricter pooled session survives query execution and request options cannot raise its limit', async () => {
  await pool.query('SET SESSION max_execution_time = 4500');
  try {
    const api = runner('request');
    expect((await api.query<any[]>('budget-fixture', {id: 4}, {queryOptions: {timeout: 120000}})).data[0].budget).toBe(4500);
    expect((await api.query<any[]>('budget-fixture', {id: 5}, {queryOptions: {timeout: 1200}})).data[0].budget).toBe(1200);
    const [settings]: any = await pool.query('SELECT @@SESSION.max_execution_time AS previous');
    expect(Number(settings[0].previous)).toBe(4500);
  } finally {await pool.query('SET SESSION max_execution_time = 0');}
});

test('managed prefetch persists shared rows that a fresh request process can read', async () => {
  const prefetch = runner('prefetch', true);
  const api = runner('request', true);
  await expect(api.query('budget-fixture', {id: 8})).rejects.toBeInstanceOf(NeedPreFetchError);
  await expect(runner('request', true, false).query('budget-fixture', {id: 8})).rejects.toBeInstanceOf(NeedPreFetchError);
  const result = await prefetch.query<any[]>('budget-fixture', {id: 8}, {refreshCache: true, ignoreOnlyFromCache: true, queryOptions: {timeout: 60000}});
  expect(result.data[0]).toEqual({id: 8, budget: 60000});
  // Cache publication is asynchronous in the existing prefetch runner.
  for (let i = 0; i < 50; i++) {
    const [rows]: any = await pool.query('SELECT COUNT(*) AS n FROM cached_table_cache');
    if (Number(rows[0].n) > 0) break;
    await delay(25);
  }
  expect((await api.query<any[]>('budget-fixture', {id: 8})).data).toEqual(result.data);
  await expect(api.query('budget-fixture', {id: 9})).rejects.toBeInstanceOf(NeedPreFetchError);
});
