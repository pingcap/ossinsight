import { Parser } from 'node-sql-parser/build/mysql';
export class SQLPolicyError extends Error {}

// Public analytics only. Explorer intentionally supports cross-repository reads.
export const PUBLIC_ANALYTICS_TABLES = new Set([
  'github_events', 'github_repos', 'github_users', 'github_repo_topics', 'trending_repos',
]);
const FUNCTIONS = new Set(`ABS AVG CEIL CEILING COALESCE CONCAT CONCAT_WS COUNT
  CURDATE CURRENT_DATE CURRENT_TIMESTAMP DATE DATE_ADD DATE_SUB DATE_FORMAT DATEDIFF
  DAY DAYOFMONTH DAYOFWEEK DAYOFYEAR DENSE_RANK EXISTS EXTRACT FIRST_VALUE FLOOR GREATEST
  GROUP_CONCAT HOUR IF IFNULL LAG LAST_VALUE LEAD LEAST LEFT LENGTH LOWER LTRIM
  MAX MIN MINUTE MOD MONTH NOW NULLIF RANK REPLACE RIGHT ROUND ROW_NUMBER RTRIM
  SECOND SIGN SQRT STDDEV STDDEV_POP STDDEV_SAMP SUBSTR SUBSTRING SUM TIMESTAMP
  TIMESTAMPADD TIMESTAMPDIFF TRIM UNIX_TIMESTAMP UPPER VAR_POP VAR_SAMP WEEK
  WEEKDAY YEAR YEARWEEK`.split(/\s+/));

export interface SQLPolicy {
  scope?: { field: 'repo_id' | 'actor_id'; id: number };
  identity?: { github_id?: number; github_login?: string };
  maxRows?: number;
}

function reject(message: string): never {
  throw new SQLPolicyError(message);
}

export function positiveId(value: unknown): number {
  if ((typeof value !== 'number' && typeof value !== 'string') ||
      !/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) {
    reject('A positive, safe integer scope ID is required');
  }
  return Number(value);
}

/** Parse, authorize, and serialize. Never execute the original input on failure. */
export function enforceSQLPolicy(sql: string, policy: SQLPolicy = {}): string {
  if (typeof sql !== 'string' || !sql.trim() || sql.length > 32000) {
    reject('A non-empty SQL statement of at most 32000 characters is required');
  }
  const parser = new Parser();
  let ast: any;
  try {
    const parsed = parser.astify(sql);
    if (Array.isArray(parsed)) {
      if (parsed.length !== 1) reject('Only one SELECT statement is allowed');
      ast = parsed[0];
    } else {
      ast = parsed;
    }
  } catch {
    reject('SQL must be a single supported SELECT statement');
  }
  if (ast?.type !== 'select') reject('Only SELECT statements are allowed');
  const scope = policy.scope;
  if (scope) {
    positiveId(scope.id);
    if (!['repo_id', 'actor_id'].includes(scope.field)) reject('Invalid scope field');
  }
  const maxRows = positiveId(policy.maxRows ?? 200);

  function visit(node: any, ctes: Set<string>): void {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(item => visit(item, ctes));
      return;
    }
    if (node.type === 'param') {
      const name = node.value;
      const identity = policy.identity;
      if (name === 'current_github_id' && identity?.github_id != null) {
        node.type = 'number';
        node.value = positiveId(identity.github_id);
      } else if (name === 'current_github_login' && identity?.github_login) {
        node.type = 'single_quote_string';
        node.value = identity.github_login;
      } else {
        reject('The SQL requests an unavailable authenticated identity or parameter');
      }
    }
    if (node.type === 'var' || node.type === 'assign' || node.db != null) {
      reject('Variables, assignments, and database-qualified references are not allowed');
    }
    if (node.type === 'function' || node.type === 'aggr_func') {
      // Keyword forms such as bare CURRENT_DATE parse with an 'origin' name part.
      const name = node.type === 'aggr_func' ? node.name :
        (!node.name?.schema && node.name?.name?.length === 1 &&
          ['default', 'origin'].includes(node.name.name[0].type)
          ? node.name.name[0].value : null);
      if (typeof name !== 'string' || !FUNCTIONS.has(name.toUpperCase())) {
        reject('This SQL function is not allowed');
      }
    }
    if (node.type === 'select') {
      if (node.into?.position || node.locking_read || node.options?.length) {
        reject('SELECT output destinations, locks, and options are not allowed');
      }
      ctes = new Set(ctes);
      for (const cte of node.with ?? []) {
        const name = cte.name?.value?.toLowerCase();
        if (!name || cte.recursive || PUBLIC_ANALYTICS_TABLES.has(name) || ctes.has(name)) {
          reject('Invalid or shadowed common table expression');
        }
        // A CTE can reference earlier CTEs, not itself or a later CTE. Treating
        // all names as visible here could authorize a real private table read.
        visit(cte.stmt, ctes);
        ctes.add(name);
      }
      for (const from of node.from ?? []) {
        if (from.table) {
          const name = from.table.toLowerCase();
          if (!PUBLIC_ANALYTICS_TABLES.has(name) && !ctes.has(name)) {
            reject('Only public analytics tables are allowed');
          }
        } else if (!from.expr?.ast) {
          reject('Unsupported SQL data source');
        }
      }
    }
    // Include expressions in SELECT, WHERE, HAVING, joins, CTEs, and UNIONs.
    Object.entries(node).forEach(([key, child]) => {
      if (node.type !== 'select' || key !== 'with') visit(child, ctes);
    });
    if (node.type === 'select' && scope) {
      for (const from of node.from ?? []) {
        if (from.table?.toLowerCase() !== 'github_events') continue;
        const scoped: any = parser.astify(
          `SELECT * FROM github_events WHERE ${scope.field} = ${scope.id}`,
        );
        const alias = from.as || from.table;
        delete from.table;
        delete from.db;
        from.expr = { ast: scoped, parentheses: true };
        from.as = alias;
      }
    }
  }
  visit(ast, new Set());
  // In this parser the last UNION branch owns the whole union's result limit.
  let result = ast;
  while (result._next) result = result._next;
  const limit = result.limit;
  if (limit?.value?.length) {
    for (const value of limit.value) {
      if (value.type !== 'number' || !Number.isSafeInteger(value.value) || value.value < 0) {
        reject('LIMIT and OFFSET must be non-negative integers');
      }
    }
    const count = limit.value[limit.seperator === ',' ? limit.value.length - 1 : 0];
    count.value = Math.min(count.value, maxRows);
  } else {
    result.limit = { seperator: '', value: [{ type: 'number', value: maxRows }] };
  }
  return parser.sqlify(ast);
}
