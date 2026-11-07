/// <reference types="jest" />
import { Parser } from 'node-sql-parser/build/mysql';
import { executeGeneratedExplorerPlan } from '../generated-query';
import { listExplorerTags } from '../../server/explorer-api';

const parser = new Parser();
const originalFetch = globalThis.fetch;
const envNames = ['EXPLORER_ANALYTICS_DATABASE_URL', 'EXPLORER_ANALYTICS_DATABASE', 'EXPLORER_DATABASE_URL', 'EXPLORER_DATABASE'] as const;
const originalEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
const allowedGrant = 'GRANT SELECT ON `analytics_fixture`.`github_events` TO `fixture`@`%`';
let statements: string[];
let grantValues: string[];
let currentDatabase: string;
let serverTimeout: number;
let sqlMode: string;
let fixtureFetch: jest.Mock;

function reply(name: string, rows: unknown[][], session: string, type = 'VARCHAR') {
  return new Response(JSON.stringify({ types: [{ name, type, nullable: false }], rows }), {
    headers: { 'TiDB-Session': session },
  });
}

beforeEach(() => {
  process.env.EXPLORER_ANALYTICS_DATABASE_URL = 'mysql://fixture:synthetic@analytics.example.invalid/analytics_fixture';
  process.env.EXPLORER_ANALYTICS_DATABASE = 'analytics_fixture';
  statements = [];
  grantValues = [allowedGrant];
  currentDatabase = 'analytics_fixture';
  serverTimeout = 5000;
  sqlMode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
  fixtureFetch = jest.fn(async (input: string, init: RequestInit) => {
    expect(input).toBe('https://http-analytics.example.invalid/v1beta/sql');
    const headers = new Headers(init.headers);
    expect(headers.get('TiDB-Database')).toBe('analytics_fixture');
    expect(headers.get('TiDB-Session')).toBe(statements.length ? `fixture-${statements.length}` : '');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const sql = JSON.parse(String(init.body)).query;
    statements.push(sql);
    const session = `fixture-${statements.length}`;
    if (sql === 'SELECT DATABASE() AS databaseName') return reply('databaseName', [[currentDatabase]], session);
    if (sql === 'SHOW GRANTS FOR CURRENT_USER') return reply('Grants', grantValues.map(grant => [grant]), session);
    if (sql.startsWith('SET SESSION')) return reply('unused', [], session);
    if (sql.startsWith('SELECT @@SESSION.max_execution_time AS maxExecutionTime')) return new Response(JSON.stringify({
      types: [{ name: 'maxExecutionTime', type: 'INT' }, { name: 'sqlMode', type: 'VARCHAR' }],
      rows: [[String(serverTimeout), sqlMode]],
    }), { headers: { 'TiDB-Session': session } });
    if (sql.startsWith('EXPLAIN')) return reply('task', [['cop[tikv]']], session);
    return reply('count', [['42']], session, 'BIGINT');
  });
  globalThis.fetch = fixtureFetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const name of envNames) {
    if (originalEnv[name] === undefined) delete process.env[name];
    else process.env[name] = originalEnv[name];
  }
  jest.useRealTimers();
});

test.each([
  'SELECT repo_id FROM github_events LIMIT 999999',
  "SELECT 'limit' AS marker FROM github_events",
  'SELECT * FROM github_events WHERE repo_id IN (SELECT repo_id FROM github_repos LIMIT 1)',
  'SELECT 1 UNION ALL SELECT 2 LIMIT 999999',
  'WITH c AS (SELECT repo_id FROM github_events LIMIT 1) SELECT * FROM c',
  'SELECT repo_id FROM github_events LIMIT 8,999999',
])('bounds the outer result before database execution: %s', async input => {
  const result = await executeGeneratedExplorerPlan(input);
  let ast: any = parser.astify(result.sql);
  while (ast._next) ast = ast._next;
  const count = ast.limit.value[ast.limit.seperator === ',' ? ast.limit.value.length - 1 : 0];
  expect(count.value).toBe(101);
  expect(statements[4]).toBe(result.sql);
  expect(statements[5]).toBe(`EXPLAIN FORMAT = 'brief' ${result.sql}`);
  expect(result.queryResult.rows).toEqual([{ count: 42 }]);
  expect(result.explainResult.rows).toEqual([{ task: 'cop[tikv]' }]);
});

test.each([
  'SELECT * FROM synthetic_private_table LIMIT 1',
  'SELECT * FROM explorer_questions',
  'SELECT (SELECT count(*) FROM mysql.user)',
  'WITH c AS (SELECT * FROM sys_users) SELECT * FROM c',
  'SELECT * FROM github_events UNION SELECT * FROM sys_users',
  'SELECT 1; DELETE FROM github_events',
  'SELECT SLEEP(20)', 'SELECT @@version',
  "SELECT * INTO OUTFILE '/tmp/export' FROM github_events",
  'SELECT * FROM github_events FOR UPDATE',
])('rejects untrusted SQL before any database request: %s', async input => {
  await expect(executeGeneratedExplorerPlan(input)).rejects.toThrow();
  expect(fixtureFetch).not.toHaveBeenCalled();
});

test('preserves harmless literals and strips model-supplied optimizer hints', async () => {
  const result = await executeGeneratedExplorerPlan("SELECT /*+ MAX_EXECUTION_TIME(0) */ 'delete; -- limit /* text */' AS label FROM github_events");
  expect(result.sql).toContain("'delete; -- limit /* text */'");
  expect(result.sql).not.toContain('MAX_EXECUTION_TIME');
});

test.each([
  'GRANT ALL PRIVILEGES ON *.* TO `fixture`@`%`',
  'GRANT SELECT ON `analytics_fixture`.* TO `fixture`@`%`',
  'GRANT SELECT ON `analytics_fixture`.`explorer_questions` TO `fixture`@`%`',
  'GRANT SELECT ON `analytics_fixture`.`github_events` TO `fixture`@`%` WITH GRANT OPTION',
  'GRANT `reader_role`@`%` TO `fixture`@`%`',
])('refuses unsafe credentials before model SQL: %s', async grant => {
  grantValues = [grant];
  await expect(executeGeneratedExplorerPlan('SELECT * FROM github_events')).rejects.toThrow();
  expect(statements).toEqual(['SELECT DATABASE() AS databaseName', 'SHOW GRANTS FOR CURRENT_USER']);
});

test('refuses missing grants and a mismatched actual database', async () => {
  grantValues = [];
  await expect(executeGeneratedExplorerPlan('SELECT 1')).rejects.toThrow();
  statements = [];
  currentDatabase = 'different_database';
  await expect(executeGeneratedExplorerPlan('SELECT 1')).rejects.toThrow('does not match');
  expect(statements).toHaveLength(1);
});

test('requires a separately configured analytics account without falling back to history credentials', async () => {
  delete process.env.EXPLORER_ANALYTICS_DATABASE_URL;
  process.env.EXPLORER_DATABASE_URL = 'mysql://history:synthetic@history.example.invalid/history';
  await expect(executeGeneratedExplorerPlan('SELECT 1')).rejects.toThrow('configured separately');
  expect(fixtureFetch).not.toHaveBeenCalled();
});

test('does not run generated SQL if the server did not retain its execution limit', async () => {
  serverTimeout = 0;
  await expect(executeGeneratedExplorerPlan('SELECT 1')).rejects.toThrow('limit was not applied');
  expect(statements).toHaveLength(4);
});

test.each(['NO_BACKSLASH_ESCAPES,STRICT_TRANS_TABLES', 'ANSI_QUOTES', '', 'STRICT_TRANS_TABLES,PIPES_AS_CONCAT'])('refuses parser/server mode mismatch: %s', async mode => {
  sqlMode = mode;
  await expect(executeGeneratedExplorerPlan("SELECT 'escaped\\\' quote' FROM github_events")).rejects.toThrow('SQL mode does not match');
  expect(statements).toHaveLength(4);
});

test('an already cancelled caller performs no database request', async () => {
  const controller = new AbortController(); controller.abort(new Error('caller cancelled'));
  await expect(executeGeneratedExplorerPlan('SELECT 1', controller.signal)).rejects.toThrow('caller cancelled');
  expect(fixtureFetch).not.toHaveBeenCalled();
});

test('caller cancellation aborts the active SDK transport', async () => {
  const controller = new AbortController();
  fixtureFetch.mockImplementation((_input: string, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal!.addEventListener('abort', () => reject(init.signal!.reason), { once: true });
    controller.abort(new Error('caller cancelled'));
  }));
  await expect(executeGeneratedExplorerPlan('SELECT 1', controller.signal)).rejects.toThrow('caller cancelled');
  expect(fixtureFetch).toHaveBeenCalledTimes(1);
});

test('the overall request deadline aborts a stalled SDK transport', async () => {
  jest.useFakeTimers();
  fixtureFetch.mockImplementation((_input: string, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal!.addEventListener('abort', () => reject(init.signal!.reason), { once: true });
  }));
  const pending = expect(executeGeneratedExplorerPlan('SELECT 1')).rejects.toThrow('timed out');
  await jest.advanceTimersByTimeAsync(15000);
  await pending;
  expect(fixtureFetch).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

test('trusted tag queries keep their existing history connection and SQL', async () => {
  process.env.EXPLORER_DATABASE_URL = 'mysql://history:synthetic@history.example.invalid/history';
  process.env.EXPLORER_DATABASE = 'history';
  fixtureFetch.mockImplementation(async (input: string, init: RequestInit) => {
    expect(input).toBe('https://http-history.example.invalid/v1beta/sql');
    expect(JSON.parse(String(init.body)).query).toContain('FROM explorer_question_tags');
    return reply('id', [['7']], 'history-session', 'INT');
  });
  expect(await listExplorerTags()).toEqual([{ id: 7 }]);
  expect(fixtureFetch).toHaveBeenCalledTimes(1);
});
