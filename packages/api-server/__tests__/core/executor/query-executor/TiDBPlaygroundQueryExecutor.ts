
import {TiDBPlaygroundQueryExecutor} from '../../../../src/core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import {SqlParser} from '../../../../src/core/playground/playground';
import {createConnection} from 'mysql2/promise';
import {createTiDBPool} from "../../../../src/utils/db";
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../../helpers/db';
import {testLogger} from "../../../helpers/log";
import {checkAnalyticsDatabase} from '../../../../src/core/playground/database-policy';

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
