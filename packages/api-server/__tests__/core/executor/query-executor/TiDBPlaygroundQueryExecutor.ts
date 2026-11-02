
import {TiDBPlaygroundQueryExecutor} from '../../../../src/core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import {SqlParser} from '../../../../src/core/playground/playground';
import {createConnection, createPool} from 'mysql2/promise';
import {PlaygroundService} from '../../../../src/plugins/services/playground-service';
import {createTiDBPool} from "../../../../src/utils/db";
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../../helpers/db';
import {testLogger} from "../../../helpers/log";
import {checkAnalyticsDatabase} from '../../../../src/core/playground/database-policy';
import {querySQLLiteral} from '@ossinsight/types';
import Redis from 'ioredis';
import {randomUUID} from 'crypto';
import {consumePublicQuota} from '../../../../src/utils/public-quota';

beforeAll(bootstrapTestDatabase);
beforeAll(async () => {
  const db = getTestDatabase();
  const conn = await createConnection({uri: db.rootUrl(), database: db.database});
  try {
    await conn.query(`INSERT INTO github_events
      (id, type, repo_id, actor_id, event_day, event_month, event_year)
      VALUES (1, 'WatchEvent', 42, 7, '2024-01-01', '2024-01-01', 2024),
             (2, 'WatchEvent', 99, 8, '2024-01-01', '2024-01-01', 2024)`);
  } finally {
    await conn.end();
  }
});
afterAll(releaseTestDatabase);

describe('connection limits', () => {
  test('concurrent public requests reserve one shared Redis quota atomically', async () => {
    const redis = new Redis({host: process.env.__REDIS_HOST, port: Number(process.env.__REDIS_PORT)});
    try {
      const identity = `test-${randomUUID()}`;
      const results = await Promise.allSettled(Array.from({length: 60}, () => consumePublicQuota(redis, identity, 25)));
      expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(25);
      const rejected = results.filter(result => result.status === 'rejected') as PromiseRejectedResult[];
      expect(rejected).toHaveLength(35);
      expect(rejected.every(result => result.reason.statusCode === 429)).toBe(true);
    } finally { await redis.quit(); }
  });
  test('named-query array literals preserve text in either SQL escaping mode', async () => {
    const conn = await createConnection({uri: getTestDatabase().rootUrl()});
    try {
      const value = "unsafe\\' OR 1=1 -- 中文";
      for (const mode of ['', 'NO_BACKSLASH_ESCAPES']) {
        await conn.query('SET SESSION sql_mode = ?', [mode]);
        const [rows] = await conn.query<any[]>(`SELECT ${querySQLLiteral(value)} AS value`);
        expect(rows[0].value).toBe(value);
        const [bound] = await conn.query<any[]>('SELECT CONVERT(UNHEX(?) USING utf8mb4) AS value', [Buffer.from(value, 'utf8').toString('hex')]);
        expect(bound[0].value).toBe(value);
      }
    } finally {
      await conn.end();
    }
  });
  test('should be executed', async () => {
    const tidbPool = createTiDBPool(getTestDatabase().analyticsUrl());
    const executor = new TiDBPlaygroundQueryExecutor(tidbPool, null, testLogger, [
      'set @abc = 1;',
    ]);

    const conn = await executor.getConnection();
    try {
      // Inspect trusted connection initialization directly. Generated SQL may
      // not read session variables, including ones initialized by the server.
      const [res] = await conn.query<any[]>('SELECT @abc AS abc, @@sql_mode AS mode');
      expect(res[0].abc).toBe(1);
      expect(res[0].mode).toContain('STRICT_TRANS_TABLES');
      expect(res[0].mode).not.toContain('NO_BACKSLASH_ESCAPES');
      await expect(executor.executeWithConn(conn, '', 'SELECT @abc')).rejects.toThrow();
    } finally {
      conn.release();
      await tidbPool.end();
    }
  });

  test('database credentials independently reject private reads and writes', async () => {
    const pool = createTiDBPool(getTestDatabase().analyticsUrl());
    try {
      await checkAnalyticsDatabase(pool);
      await expect(pool.query('SELECT COUNT(*) FROM github_events')).resolves.toBeDefined();
      await expect(pool.query('SELECT * FROM sys_users')).rejects.toThrow();
      await expect(pool.query('DELETE FROM github_events WHERE 1 = 0')).rejects.toThrow();
    } finally {
      await pool.end();
    }
  });

  test.each([
    ['SELECT id FROM github_events WHERE repo_id = 99 OR 1 = 1', [{id: 1}]],
    ['SELECT a.id AS a, b.id AS b FROM github_events a JOIN github_events b ON 1 = 1', [{a: 1, b: 1}]],
    ['SELECT id, (SELECT COUNT(*) FROM github_events) AS total FROM github_events', [{id: 1, total: 1}]],
    ['WITH events AS (SELECT * FROM github_events) SELECT id FROM events', [{id: 1}]],
    ['SELECT id FROM github_events UNION ALL SELECT id FROM github_events', [{id: 1}, {id: 1}]],
  ])('executes every event scan inside the selected repository: %s', async (sql, expected) => {
    const pool = createTiDBPool(getTestDatabase().analyticsUrl());
    try {
      const executor = new TiDBPlaygroundQueryExecutor(pool, null, testLogger);
      const [rows] = await executor.execute<any[]>('scope-regression', new SqlParser('repo', '42', sql as string).sqlify());
      expect(rows).toEqual(expected);
    } finally {
      await pool.end();
    }
  });
});


test('concurrent first requests reserve one shared daily quota before any LLM work', async () => {
  const url = new URL(getTestDatabase().rootUrl());
  url.pathname = getTestDatabase().database;
  const pool = createPool({uri: url.toString(), connectionLimit: 8});
  try {
    await pool.query("INSERT INTO sys_users (id, name, email_address) VALUES (4242, 'quota test', 'test@example.invalid')");
    await pool.query(`CREATE TABLE playground_question_records (
      id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, context JSON,
      question TEXT, \`sql\` TEXT, success BOOLEAN NOT NULL, preset BOOLEAN NOT NULL,
      requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX user_requests (user_id, requested_at)
    )`);
    // An upgraded cluster may still default to optimistic transactions.
    const connections = await Promise.all(Array.from({length: 8}, () => pool.getConnection()));
    await Promise.all(connections.map(async conn => {
      await conn.query("SET SESSION tidb_txn_mode = 'optimistic'");
      conn.release();
    }));
    const service = new PlaygroundService(pool);
    const results = await Promise.allSettled(Array.from({length: 20}, () => service.reserveQuestion(4242, {repo_id: 42}, 'stats', 3)));
    const accepted = results.filter(result => result.status === 'fulfilled');
    const denied = results.filter(result => result.status === 'rejected') as PromiseRejectedResult[];
    expect(accepted).toHaveLength(3);
    expect(denied).toHaveLength(17);
    expect(denied.every(result => result.reason.statusCode === 429)).toBe(true);
    expect(await service.countTodayQuestionRequests(4242, false)).toBe(3);
  } finally { await pool.end(); }
});


test('private collections remain inaccessible through named SQL and warmed caches', async () => {
  const {CollectionService} = await import('../../../../src/plugins/services/collection-service');
  const {TiDBQueryExecutor} = await import('../../../../src/core/executor/query-executor/TiDBQueryExecutor');
  const {QueryLoader} = await import('../../../../src/core/runner/query/QueryLoader');
  const {QueryLegacyParser} = await import('../../../../src/core/runner/query/QueryLegacyParser');
  const url = new URL(getTestDatabase().rootUrl());
  url.pathname = getTestDatabase().database;
  const pool = createPool(url.toString());
  try {
    await pool.query("INSERT INTO collections (id, name, public) VALUES (90001, 'public test', 1), (90002, 'private test', 0)");
    await pool.query("INSERT INTO collection_items (collection_id, repo_name, repo_id) VALUES (90001, 'pingcap/tidb', 42), (90002, 'hidden/association', 42)");
    let cached: any;
    const cacheBuilder = {build: () => ({load: async (load: any) => cached ?? (cached = await load())})};
    const executor = new TiDBQueryExecutor(pool, null, testLogger);
    const service = new CollectionService(testLogger, executor, cacheBuilder as any);
    const publicIds = (await service.getCollections()).data.map(row => Number(row.id));
    expect(publicIds).toContain(90001);
    expect(publicIds).not.toContain(90002);
    await expect(service.getCollectionRepos(90002)).rejects.toMatchObject({statusCode: 404});
    expect((await service.getCollectionRepos(90001)).data).toHaveLength(1);
    const [config, template] = await new QueryLoader(testLogger).load('get-repo-collections');
    const sql = await new QueryLegacyParser().parse(template!, config!, {repoId: 42});
    const [rows] = await pool.query<any[]>(sql);
    expect(rows.map(row => Number(row.id))).toEqual([90001]);
    await pool.query('UPDATE collections SET public = 0 WHERE id = 90001');
    await expect(service.getCollectionRepos(90001)).rejects.toMatchObject({statusCode: 404});
    const [hidden] = await pool.query<any[]>(sql);
    expect(hidden).toHaveLength(0);
  } finally { await pool.end(); }
});
