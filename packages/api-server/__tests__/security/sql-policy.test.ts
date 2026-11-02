import { enforceSQLPolicy, positiveId } from '../../src/core/playground/sql-policy';
import { SqlParser } from '../../src/core/playground/playground';
import { Parser } from 'node-sql-parser';

const parser = new Parser();
const scoped = (sql: string) => new SqlParser('repo', '42', sql).sqlify();

// Assert every physical scan is protected, regardless of where it is nested.
function scans(ast: any): any[] {
  if (!ast || typeof ast !== 'object') return [];
  if (Array.isArray(ast)) return ast.flatMap(scans);
  const here = ast.type === 'select' && ast.from?.some((f: any) => f.table === 'github_events') ? [ast] : [];
  return [...here, ...Object.values(ast).flatMap(scans)];
}

describe('SQL execution policy', () => {
  test.each([
    'SELECT COUNT(*) FROM github_events WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)',
    'SELECT COUNT(*) FROM github_events WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL 7 DAY',
  ])('allows keyword-form date functions: %s', sql => expect(() => enforceSQLPolicy(sql)).not.toThrow());

  test.each([
    'DELETE FROM github_events', 'UPDATE github_events SET repo_id=42',
    'DROP TABLE github_events', 'SELECT 1; DELETE FROM github_events',
    'SHOW INDEXES FROM github_events', 'this is not SQL',
    'SELECT * FROM sys_users', 'SELECT * FROM mysql.user',
    'SELECT * FROM other_database.github_events',
    'SELECT (SELECT COUNT(*) FROM sys_users)',
    'WITH c AS (SELECT * FROM sys_users) SELECT * FROM c',
    'WITH a AS (SELECT * FROM sys_users), sys_users AS (SELECT 1) SELECT * FROM a',
    'WITH sys_users AS (SELECT * FROM sys_users) SELECT * FROM sys_users',
    'SELECT * FROM github_events UNION SELECT * FROM sys_users',
    "SELECT id INTO OUTFILE '/tmp/leak' FROM github_events",
    "SELECT id INTO DUMPFILE '/tmp/leak' FROM github_events",
    'SELECT * FROM github_events FOR UPDATE',
    'SELECT * FROM github_events LOCK IN SHARE MODE',
    'SELECT @x', 'SELECT @@version', 'SELECT @x := 1',
    'SELECT SLEEP(10)', 'SELECT SLEEP /* gap */ (10)',
    'SELECT BENCHMARK(1000000,1)', "SELECT LOAD_FILE('/etc/passwd')",
    "SELECT GET_LOCK('key',10)", 'SELECT unknown_udf()',
    'SELECT CURRENT_USER()', 'SELECT DATABASE()',
    'SELECT SQL_CALC_FOUND_ROWS * FROM github_events',
    'SELECT :current_github_id',
  ])('rejects %s', sql => expect(() => enforceSQLPolicy(sql)).toThrow());

  test.each([
    ['SELECT * FROM github_events', 1],
    ['SELECT * FROM github_events WHERE repo_id=99 OR 1=1', 1],
    ['SELECT * FROM github_events a JOIN github_events b ON 1=1 WHERE a.repo_id=42', 2],
    ['SELECT (SELECT COUNT(*) FROM github_events) FROM github_events WHERE repo_id=42', 2],
    ['SELECT * FROM github_events WHERE EXISTS (SELECT 1 FROM github_events e)', 2],
    ['SELECT COUNT(*) FROM github_events HAVING (SELECT COUNT(*) FROM github_events)>0', 2],
    ['WITH c AS (SELECT * FROM github_events) SELECT * FROM c', 1],
    ['WITH a AS (SELECT * FROM github_events), b AS (SELECT * FROM a) SELECT * FROM b', 1],
    ['SELECT * FROM (SELECT * FROM github_events) a', 1],
    ['SELECT * FROM github_events UNION ALL SELECT * FROM github_events', 2],
  ])('scopes all physical event scans: %s', (sql, count) => {
    const physical = scans(parser.astify(scoped(String(sql))));
    expect(physical).toHaveLength(count as number);
    for (const scan of physical) {
      expect(scan.where).toMatchObject({operator: '=', left: {column: 'repo_id'}, right: {type: 'number', value: 42}});
    }
  });

  test.each([undefined, null, 0, '', -1, 1.1, '42x', '1e3', NaN, Number.MAX_SAFE_INTEGER + 1])('rejects invalid scope %s', id => {
    expect(() => positiveId(id)).toThrow();
    expect(() => new SqlParser('repo', id as any, 'SELECT 1').sqlify()).toThrow();
  });

  test.each([
    'SELECT * FROM github_events LIMIT 1000',
    'SELECT * FROM github_events LIMIT 8,1000',
    'SELECT * FROM github_events LIMIT 1000 OFFSET 8',
    'SELECT 1 UNION SELECT 2 LIMIT 1000',
  ])('caps the result count with offsets/unions: %s', sql => {
    let ast: any = parser.astify(enforceSQLPolicy(sql));
    while(ast._next) ast = ast._next;
    const count = ast.limit.value[ast.limit.seperator === ',' ? ast.limit.value.length - 1 : 0];
    expect(count.value).toBe(200);
  });

  test('permits public cross-repository analytics and literals containing SQL words', () => {
    expect(enforceSQLPolicy("SELECT 'delete; drop table' AS label, COUNT(*) FROM github_events")).toContain("'delete; drop table'");
  });
  test('binds verified identity locally', () => {
    expect(enforceSQLPolicy('SELECT * FROM github_events WHERE actor_id=:current_github_id', {identity: {github_id: 7}})).toContain('= 7');
    expect(enforceSQLPolicy('SELECT :current_github_login', {identity: {github_login: 'real-user'}})).toContain("'real-user'");
  });
  test('uses actor scope for the user playground', () => {
    const ast = parser.astify(new SqlParser('user', '7', 'SELECT * FROM github_events').sqlify());
    expect(scans(ast)[0].where.left.column).toBe('actor_id');
  });
});
