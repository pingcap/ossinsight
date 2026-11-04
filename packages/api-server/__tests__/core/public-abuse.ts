import Fastify from 'fastify';
import fp from 'fastify-plugin';
import urlData from '@fastify/url-data';
import {createPool, Pool} from 'mysql2/promise';
import pino from 'pino';
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../helpers/db';
import {BatchLoader} from '../../src/core/db/batch-loader';
import recorder from '../../src/plugins/stats/api-request-recorder';
import {literalLikePrefix} from '../../../../apps/web/lib/server/search-keyword';

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

test('real recorder writes bounded inputs and one final error row into the production-shaped schema', async () => {
  const app = Fastify();app.decorate('mysql', pool);
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  await app.register(fp(async () => {}, {name: '@ossinsight/tidb'}));
  await app.register(urlData);await app.register(recorder);
  app.get('/recorder-error', async () => {throw new Error('fixture');});
  const requestPath = '/recorder-long-' + 'a'.repeat(500);
  try {
    await app.inject({url: requestPath, headers: {origin: 'https://' + 'a'.repeat(500)}});
    await app.inject('/recorder-error');
    await app.apiRequestRecorder.flush();
    const [rows]: any = await pool.query("SELECT path,OCTET_LENGTH(client_origin) AS originBytes,OCTET_LENGTH(path) AS pathBytes,error,status_code FROM stats_api_requests WHERE path LIKE '/recorder-%' ORDER BY path");
    expect(rows).toHaveLength(2);
    expect(rows.every((row: any) => row.originBytes <= 255 && row.pathBytes <= 255)).toBe(true);
    expect(rows.find((row: any) => row.path === '/recorder-error')).toMatchObject({error: 1, status_code: 500});
  } finally {await app.close();}
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
