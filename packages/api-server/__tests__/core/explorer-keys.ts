import {createHash, randomUUID} from 'node:crypto';
import {DateTime} from 'luxon';
import {createPool, Pool} from 'mysql2/promise';
import pino from 'pino';
import {ExplorerService} from '../../src/plugins/services/explorer-service';
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../helpers/db';

let pool: Pool;
let service: ExplorerService;
const title = 'Monthly café activity';
const sql = "SELECT 'café  report'";

beforeAll(async () => {
  await bootstrapTestDatabase();
  pool = createPool(getTestDatabase().url());
  service = new ExplorerService(pino({enabled: false}), pool as any, {} as any, {} as any, {} as any, {} as any);
});
afterAll(async () => {
  await pool?.end();
  await releaseTestDatabase();
});

test('new keys hash UTF-8 and keep question and SQL namespaces separate', () => {
  const key = service['getQueryHash'](sql);
  expect(key).toBe(createHash('sha256').update('explorer:sql:v2\0' + sql, 'utf8').digest('hex'));
  expect(key).not.toBe(service['getQueryHash'](sql.replace('  ', ' ')));
  expect(key).not.toBe(service['getQuestionHash'](sql));
  expect(service['getQuestionHash']('東京')).not.toBe(service['getQuestionHash']('大阪'));
});

test('cache hits require the original SQL and the same user', async () => {
  const key = service['getQueryHash'](sql);
  await pool.execute(`INSERT INTO explorer_questions
    (id,hash,user_id,status,title,query_sql,query_hash,result,spent,executed_at,finished_at)
    VALUES (UUID_TO_BIN(?),?,?,'success',?,?,?, ?,1,NOW(),NOW())`,
    [randomUUID(), service['getQuestionHash'](title), 31, title, sql, key, JSON.stringify({fields: [], rows: [['fixture']]})]);
  expect(await service.getCachedSQLResult(key, sql, 31, 60)).toMatchObject({result: {rows: [['fixture']]}, spent: 1});
  expect(await service.getCachedSQLResult(key, sql, 32, 60)).toBeNull();
  expect(await service.getCachedSQLResult(key, sql.replace('  ', ' '), 31, 60)).toBeNull();
  expect(await service.getCachedSQLResult(key, sql + ' ', 31, 60)).toBeNull();
});

test('publication selects only earlier records for the same normalized title', async () => {
  const current = {title, hash: service['getQuestionHash'](title)};
  const previousKey = createHash('sha256').update(title, 'latin1').digest('hex');
  const previousId = randomUUID();
  for (const [id, hash, oldTitle, published] of [
    [previousId, previousKey, 'Monthly  café activity', 1],
    [randomUUID(), previousKey, 'Unrelated report', 1],
    [randomUUID(), current.hash, title, 0],
  ]) {
    await pool.execute(`INSERT INTO explorer_questions (id,hash,title,user_id,status,recommended)
      VALUES (UUID_TO_BIN(?),?,?,31,'success',?)`, [id, hash, oldTitle, published]);
  }
  const connection = await pool.getConnection();
  try {
    expect(await service['getRecommendedIdsForTitle'](connection, current as any)).toEqual([previousId]);
  } finally {connection.release();}
});

test('saving suggestions retains historical keys for exact titles and derives keys for new entries', async () => {
  const historicalKey = 'legacy-opaque-fixture';
  const item = {title, hash: historicalKey, createdAt: DateTime.utc(), questionId: null, aiGenerated: true};
  await pool.execute('INSERT INTO explorer_recommend_questions(hash,title,ai_generated) VALUES (?,?,0)', [historicalKey, title]);
  const otherTitle = 'Monthly  café activity';
  for (let i = 0; i < 2; i++) {
    await service.saveRecommendQuestions([item, {...item, title: otherTitle, aiGenerated: false}]);
  }
  const [rows] = await pool.query('SELECT hash,title,ai_generated FROM explorer_recommend_questions WHERE title IN (?)', [[title, otherTitle]]);
  expect(rows).toHaveLength(2);
  expect(rows).toEqual(expect.arrayContaining([
    {hash: historicalKey, title, ai_generated: 1},
    {hash: service['getQuestionHash'](otherTitle), title: otherTitle, ai_generated: 0},
  ]));
});
