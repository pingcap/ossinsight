import Fastify from 'fastify';
import fp from 'fastify-plugin';
import urlData from '@fastify/url-data';
import mysqlPlugin from '@fastify/mysql';
import {createConnection, createPool, Pool} from 'mysql2/promise';
import pino from 'pino';
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../helpers/db';
import {BatchLoader} from '../../src/core/db/batch-loader';
import recorder from '../../src/plugins/stats/api-request-recorder';
import {literalLikePrefix} from '../../../../apps/web/lib/server/search-keyword';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

let pool: Pool;
beforeAll(async () => {await bootstrapTestDatabase();pool = createPool(getTestDatabase().url());});
afterAll(async () => {await pool?.end();await releaseTestDatabase();});
const log = pino({enabled: false});

test('strict TiDB preserves 99 good audit rows when one oversized origin poisons their batch', async () => {
  const [mode]: any = await pool.query('SELECT @@sql_mode AS mode');
  expect(mode[0].mode).toMatch(/STRICT_/);
  const insert = 'INSERT INTO stats_api_requests(client_ip,client_origin,method,path,query,error,status_code,duration,is_dev) VALUES ?';
  const loader = new BatchLoader(log, pool, insert, {batchSize: 100, flushInterval: -1});
  try {
    for (let index = 0; index < 100; index++) {
      await loader.insert(['192.0.2.1', index === 42 ? 'x'.repeat(300) : 'https://fixture.invalid', index === 99 ? 'OPTIONS' : 'GET',
        `/fixture-${String(index).padStart(3, '0')}`, '{}', false, 200, 1, true]);
    }
    await loader.flush();
    const [rows]: any = await pool.query("SELECT path FROM stats_api_requests WHERE path LIKE '/fixture-%' ORDER BY path");
    expect(rows.map((row: any) => row.path)).toEqual(Array.from({length: 100}, (_, index) => `/fixture-${String(index).padStart(3, '0')}`).filter(path => path !== '/fixture-042'));
  } finally {await loader.destroy();}
});

test('real recorder minimizes stored inputs and preserves one final response in the production-shaped schema', async () => {
  const app = Fastify();
  await app.register(mysqlPlugin, {promise: true, uri: getTestDatabase().url(), connectionLimit: 2});
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  await app.register(fp(async () => {}, {name: '@ossinsight/tidb'}));
  await app.register(urlData);await app.register(recorder);
  app.get('/recorder-error', async () => {throw new Error('fixture');});
  app.get('/q/:query', async () => ({ok: true}));
  app.get('/healthy', async () => ({healthy: true}));
  app.get('/metrics', async () => 'fixture metrics');
  const requestPath = '/recorder-long-' + 'a'.repeat(500);
  try {
    await app.inject({url: requestPath, headers: {origin: 'https://' + 'a'.repeat(500)}});
    await app.inject('/recorder-error');
    await app.inject({url: '/q/collection-issues-history?collectionId=10001&token=synthetic-secret&sql=private-input&limit=5',
      remoteAddress: '192.0.2.123', headers: {origin: 'https://private-fixture.invalid', authorization: 'Bearer synthetic-secret'}});
    await app.inject('/healthy?token=synthetic-secret');
    await app.inject('/metrics?collectionId=10001');
    await app.apiRequestRecorder.flush();
    const [rows]: any = await pool.query("SELECT client_ip,client_origin,path,query,error,status_code FROM stats_api_requests WHERE path NOT LIKE '/fixture-%' ORDER BY path");
    expect(rows).toHaveLength(3);
    expect(rows.every((row: any) => row.client_ip === '' && row.client_origin === '' && Buffer.byteLength(row.path) <= 255)).toBe(true);
    expect(rows.find((row: any) => row.path === 'unmatched')).toMatchObject({error: 1, status_code: 404});
    expect(rows.find((row: any) => row.path === '/recorder-error')).toMatchObject({error: 1, status_code: 500});
    const collection = rows.find((row: any) => row.path === '/q/collection-issues-history');
    expect(typeof collection.query === 'string' ? JSON.parse(collection.query) : collection.query).toEqual({collectionId: 10001, limit: 5});
    expect(JSON.stringify(rows)).not.toMatch(/synthetic-secret|private-input|private-fixture|192\.0\.2\.123|recorder-long/);
  } finally {await app.close();}
});

test('actual collection pipeline counts successful production GETs and clears stale totals without coercing IDs', async () => {
  // The public API account intentionally cannot change collections. This
  // pipeline fixture uses only the disposable test container's own schema.
  const database = getTestDatabase();
  const pipeline = await createConnection(`${database.rootUrl()}/${database.database}`);
  try {
    await pool.query('DELETE FROM stats_api_requests');
    const ids = [71001, 71002, 71003];
    await pipeline.query('INSERT INTO collections(id,name,past_month_visits) VALUES ?',
      [ids.map(id => [id, `activity-fixture-${id}`, 99])]);
    const rows: any[][] = [];
    function record(collectionId: unknown, overrides: {path?: string, method?: string, status?: number, error?: number, dev?: number, ageDays?: number} = {}) {
      rows.push([overrides.path ?? '/q/collection-issues-history', overrides.method ?? 'GET', JSON.stringify({collectionId}),
        overrides.status ?? 200, overrides.error ?? 0, overrides.dev ?? 0, new Date(Date.now() - (overrides.ageDays ?? 1) * 86400000)]);
    }
    record(ids[0]);record(String(ids[0]), {status: 204});
    for (const status of [301, 400, 401, 403, 404, 429, 500, 503]) record(ids[0], {status, error: status >= 400 ? 1 : 0});
    record(ids[0], {error: 1});record(ids[0], {dev: 1});record(ids[0], {ageDays: 40});record(ids[0], {ageDays: -1});
    for (const method of ['POST', 'OPTIONS', 'HEAD']) record(ids[0], {method});
    record(ids[0], {path: '/q/events-total'});
    for (const value of ['71001junk', '071001', '71001.0', '7.1001e4', '71001\n', '-71001', '9223372036854775808', null, [71001], {id: 71001}]) record(value);
    record(ids[1], {status: 429, error: 1});record(ids[2], {ageDays: 40});
    await pool.query('INSERT INTO stats_api_requests(path,method,query,status_code,error,is_dev,finished_at) VALUES ?', [rows]);
    const sql = await readFile(resolve(__dirname, '../../../../configs/pipelines/calc_collection_visits/process.sql'), 'utf8');
    for (let run = 0; run < 2; run++) {
      await pipeline.query(sql);
      const [actual]: any = await pool.query('SELECT id,past_month_visits FROM collections WHERE id IN (?) ORDER BY id', [ids]);
      expect(actual).toEqual(ids.map((id, index) => ({id, past_month_visits: index === 0 ? 2 : 0})));
    }
  } finally {await pipeline.end();}
});

test.each(['', 'NO_BACKSLASH_ESCAPES'])('literal LIKE prefixes remain literal under SQL mode %s', async extraMode => {
  const connection = await pool.getConnection();
  try {
    await connection.query('SET SESSION sql_mode = ?', ['STRICT_TRANS_TABLES' + (extraMode ? ',' + extraMode : '')]);
    const pattern = literalLikePrefix('owner/repo_name!%');
    const [rows]: any = await connection.execute("SELECT ? LIKE CONCAT(?, '%') ESCAPE '!' AS literal_match, ? LIKE CONCAT(?, '%') ESCAPE '!' AS wildcard_match", ['owner/repo_name!%suffix', pattern, 'owner/repoXname!anything', pattern]);
    expect(rows[0]).toEqual({literal_match: 1, wildcard_match: 0});
  } finally {connection.release();}
});
