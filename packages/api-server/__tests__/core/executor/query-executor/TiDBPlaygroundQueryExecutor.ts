
import {TiDBPlaygroundQueryExecutor} from '../../../../src/core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import {SqlParser} from '../../../../src/core/playground/playground';
import {createConnection, createPool} from 'mysql2/promise';
import {PlaygroundService} from '../../../../src/plugins/services/playground-service';
import {createTiDBPool} from "../../../../src/utils/db";
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../../helpers/db';
import {testLogger} from "../../../helpers/log";
import {checkAnalyticsDatabase} from '../../../../src/core/playground/database-policy';
import {querySQLLiteral} from '@ossinsight/types';

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
  test('named-query array literals preserve text in either SQL escaping mode', async () => {
    const conn = await createConnection({uri: getTestDatabase().rootUrl()});
    try {
      const value = "unsafe\\' OR 1=1 -- 中文";
      for (const mode of ['', 'NO_BACKSLASH_ESCAPES']) {
        await conn.query('SET SESSION sql_mode = ?', [mode]);
        const [rows] = await conn.query<any[]>(`SELECT ${querySQLLiteral(value)} AS value`);
        expect(rows[0].value).toBe(value);
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
