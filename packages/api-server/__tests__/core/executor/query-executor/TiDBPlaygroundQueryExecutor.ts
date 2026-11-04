
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
import {randomBytes, randomUUID} from 'crypto';
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
      const [res] = await conn.query<any[]>('SELECT @abc AS abc, @@sql_mode AS mode, @@max_execution_time AS budget');
      expect(res[0].abc).toBe(1);
      expect(res[0].mode).toContain('STRICT_TRANS_TABLES');
      expect(res[0].mode).not.toContain('NO_BACKSLASH_ESCAPES');
      expect(Number(res[0].budget)).toBe(30000);
      await executor.executeWithConn(conn, 'timeout-regression', {
        sql: 'SELECT /*+ MAX_EXECUTION_TIME(0) SET_VAR(max_execution_time=0) */ 1', timeout: 1000,
      });
      const [limited] = await conn.query<any[]>('SELECT @@max_execution_time AS budget');
      expect(Number(limited[0].budget)).toBe(1000);
      await executor.executeWithConn(conn, 'timeout-regression', 'SELECT 1');
      const [restored] = await conn.query<any[]>('SELECT @@max_execution_time AS budget');
      expect(Number(restored[0].budget)).toBe(30000);
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
    const {QueryRunner} = await import('../../../../src/core/runner/query/QueryRunner');
    const {default: Cache} = await import('../../../../src/core/cache/Cache');
    const values = new Map<string, any>();
    const provider = {get: async (key: string) => values.get(key), set: async (key: string, value: string) => {values.set(key, JSON.parse(value));}};
    const queryCache = {build: (_provider: string, key: string, hours: number, only: boolean, refresh: boolean) => new Cache(testLogger, provider, key, hours, only, refresh)};
    const runner = new QueryRunner(testLogger, queryCache as any, new QueryLoader(testLogger), executor, pool);
    const executed = jest.spyOn(executor, 'execute');
    expect((await runner.query<any[]>('get-repo-collections', {repoId: 42})).data.map(row => Number(row.id))).toEqual([90001]);
    await pool.query("UPDATE collections SET name = 'renamed public collection' WHERE id = 90001");
    expect((await runner.query<any[]>('get-repo-collections', {repoId: 42})).data[0].name).toBe('renamed public collection');
    await pool.query('UPDATE collection_items SET deleted_at = NOW() WHERE collection_id = 90001');
    expect((await runner.query<any[]>('get-repo-collections', {repoId: 42})).data).toEqual([]);
    await pool.query('UPDATE collection_items SET deleted_at = NULL WHERE collection_id = 90001');
    await pool.query('UPDATE collections SET public = 0 WHERE id = 90001');
    await expect(service.getCollectionRepos(90001)).rejects.toMatchObject({statusCode: 404});
    const [hidden] = await pool.query<any[]>(sql);
    expect(hidden).toHaveLength(0);
    expect((await runner.query<any[]>('get-repo-collections', {repoId: 42})).data).toHaveLength(0);
    expect(values.size).toBe(1);
    expect(executed.mock.calls.filter(([key]) => key === 'query:get-repo-collections')).toHaveLength(1);
  } finally { await pool.end(); }
});

// Real database tests: process SQL and its completion marker must share a transaction.
describe('pipeline backfill transactions', () => {
  const {PipelineJobRepository} = require('../../../../../pipeline/src/plugins/repositories/PipelineJobRepository');
  const {DateTime} = require('luxon');
  const from = DateTime.utc(2024, 1, 1);
  const to = DateTime.utc(2024, 1, 2);
  let pool: ReturnType<typeof createPool>;
  beforeAll(async () => {
    pool = createPool({uri: getTestDatabase().rootUrl(), database: getTestDatabase().database,
      connectionLimit: 12, namedPlaceholders: true, timezone: 'Z'});
    await pool.query(`CREATE TABLE sys_pipelines_jobs (
      job_id BIGINT PRIMARY KEY AUTO_INCREMENT, pipeline_name VARCHAR(128) NOT NULL,
      time_range_start DATETIME(3) NOT NULL, time_range_end DATETIME(3) NOT NULL,
      status VARCHAR(16) NOT NULL, ended_at DATETIME, message TEXT, duration DOUBLE)`);
    for (const name of ['001_atomic_pipeline_jobs.sql', '002_pipeline_job_lookup_index.sql']) {
      const migration = require('fs').readFileSync(require('path').resolve(__dirname, '../../../../../pipeline/migrations', name), 'utf8');
      await pool.query(migration);
    }
    await pool.query('CREATE TABLE pipeline_test_effects (name VARCHAR(128) PRIMARY KEY, executions INT NOT NULL)');
  });
  afterAll(async () => { await pool?.end(); });

  test('25 concurrent backfills commit exactly one effect and completion', async () => {
    const repository = new PipelineJobRepository(pool);
    const sql = "INSERT INTO pipeline_test_effects VALUES ('concurrent', 1) ON DUPLICATE KEY UPDATE executions = executions + 1";
    const results = await Promise.all(Array.from({length: 25}, () => repository.executeRange('concurrent', from, to, sql)));
    expect(results.filter(Boolean)).toHaveLength(1);
    const [effects] = await pool.query<any[]>("SELECT executions FROM pipeline_test_effects WHERE name = 'concurrent'");
    const [jobs] = await pool.query<any[]>("SELECT status FROM sys_pipelines_jobs WHERE pipeline_name = 'concurrent'");
    expect(effects[0].executions).toBe(1);
    expect(jobs).toEqual([{status: 'SUCCEED'}]);
  });

  test('preprovisioned locks serialize workers with SELECT-only lock access and missing locks fail closed', async () => {
    const username = `pipeline_lock_${randomBytes(6).toString('hex')}`;
    const password = randomBytes(32).toString('base64');
    const database = getTestDatabase().database;
    let limited: ReturnType<typeof createPool> | undefined;
    await pool.query("CREATE USER ?@'%' IDENTIFIED BY ?", [username, password]);
    try {
      await pool.query("GRANT SELECT ON ?? TO ?@'%'", [`${database}.sys_pipeline_locks`, username]);
      for (const table of ['sys_pipelines_jobs', 'pipeline_test_effects']) {
        await pool.query("GRANT SELECT, INSERT, UPDATE ON ?? TO ?@'%'", [`${database}.${table}`, username]);
      }
      await pool.execute('INSERT INTO sys_pipeline_locks (pipeline_name) VALUES (?)', ['readonly-concurrent']);
      const url = new URL(getTestDatabase().rootUrl());
      url.username = username;
      url.password = password;
      limited = createPool({uri: url.toString(), database, connectionLimit: 12, namedPlaceholders: true, timezone: 'Z'});
      await expect(limited.execute("INSERT INTO sys_pipeline_locks VALUES ('denied')")).rejects.toThrow(/denied/i);
      await expect(limited.execute('UPDATE sys_pipeline_locks SET pipeline_name = pipeline_name')).rejects.toThrow(/denied|privilege check for 'Update' fail/i);

      const workers = [new PipelineJobRepository(limited), new PipelineJobRepository(limited)];
      await Promise.all(workers.map(worker => worker.assertReady()));
      const sql = "INSERT INTO pipeline_test_effects VALUES ('readonly-concurrent', 1) ON DUPLICATE KEY UPDATE executions = executions + 1";
      const results = await Promise.all(Array.from({length: 25}, (_, index) =>
        workers[index % workers.length].executeRange('readonly-concurrent', from, to, sql)));
      expect(results.filter(Boolean)).toHaveLength(1);
      await expect(workers[0].executeRange('readonly-missing', from, to,
        "INSERT INTO pipeline_test_effects VALUES ('readonly-missing', 1)")).rejects.toThrow(/denied/i);
      const [effects] = await pool.query<any[]>("SELECT name, executions FROM pipeline_test_effects WHERE name LIKE 'readonly-%'");
      const [jobs] = await pool.query<any[]>("SELECT pipeline_name, status FROM sys_pipelines_jobs WHERE pipeline_name LIKE 'readonly-%'");
      expect(effects).toEqual([{name: 'readonly-concurrent', executions: 1}]);
      expect(jobs).toEqual([{pipeline_name: 'readonly-concurrent', status: 'SUCCEED'}]);
    } finally {
      await limited?.end();
      await pool.query("DROP USER IF EXISTS ?@'%'", [username]);
    }
  });

  test('failure after data writes rolls back, records a safe failure with a one-connection pool, and retries once', async () => {
    const single = createPool({uri: getTestDatabase().rootUrl(), database: getTestDatabase().database,
      connectionLimit: 1, namedPlaceholders: true, timezone: 'Z'});
    try {
      const [before] = await single.query<any[]>('SELECT @@SESSION.sql_mode AS mode');
      let injected = false;
      const faultPool = {execute: single.execute.bind(single), getConnection: async () => {
        const connection = await single.getConnection();
        return new Proxy(connection, {get(target, property) {
          if (property === 'execute') return async (sql: string, params: any) => {
            if (!injected && sql.startsWith('UPDATE sys_pipelines_jobs')) {
              injected = true;
              throw new Error('private SQL detail: simulated crash before completion');
            }
            return target.execute(sql, params);
          };
          const value = Reflect.get(target, property);
          return typeof value === 'function' ? value.bind(target) : value;
        }});
      }};
      const sql = "INSERT INTO pipeline_test_effects VALUES ('rollback', 1) ON DUPLICATE KEY UPDATE executions = executions + 1";
      await expect(new PipelineJobRepository(faultPool).executeRange('rollback', from, to, sql)).rejects.toThrow('simulated crash');
      const [effects] = await single.query<any[]>("SELECT * FROM pipeline_test_effects WHERE name = 'rollback'");
      const [failed] = await single.query<any[]>("SELECT status, message FROM sys_pipelines_jobs WHERE pipeline_name = 'rollback'");
      expect(effects).toEqual([]);
      expect(failed).toHaveLength(1);
      expect(failed[0].status).toBe('FAILED');
      expect(failed[0].message).not.toContain('private SQL detail');
      const repository = new PipelineJobRepository(single);
      expect(await repository.executeRange('rollback', from, to, sql)).toBe(true);
      expect(await repository.executeRange('rollback', from, to, sql)).toBe(false);
      const [after] = await single.query<any[]>('SELECT @@SESSION.sql_mode AS mode');
      expect(after[0].mode).toBe(before[0].mode);
    } finally { await single.end(); }
  });

  test('periodic refreshes remain repeatable while historical backfill is deduplicated', async () => {
    const repository = new PipelineJobRepository(pool);
    const sql = "INSERT INTO pipeline_test_effects VALUES ('refresh', 1) ON DUPLICATE KEY UPDATE executions = executions + 1";
    expect(await repository.executeRange('refresh', from, to, sql, false)).toBe(true);
    expect(await repository.executeRange('refresh', from, to, sql, false)).toBe(true);
    expect(await repository.executeRange('refresh', from, to, sql)).toBe(false);
    const [effects] = await pool.query<any[]>("SELECT executions FROM pipeline_test_effects WHERE name = 'refresh'");
    expect(effects[0].executions).toBe(2);
  });

  test('legacy running rows require reconciliation instead of silently replaying writes', async () => {
    await pool.execute("INSERT INTO sys_pipelines_jobs (pipeline_name, time_range_start, time_range_end, status) VALUES ('legacy', '2024-01-01', '2024-01-02', 'RUNNING')");
    const repository = new PipelineJobRepository(pool);
    await expect(repository.executeRange('legacy', from, to, "INSERT INTO pipeline_test_effects VALUES ('legacy', 1)")).rejects.toMatchObject({statusCode: 409});
    const [effects] = await pool.query<any[]>("SELECT * FROM pipeline_test_effects WHERE name = 'legacy'");
    expect(effects).toEqual([]);
  });
});
