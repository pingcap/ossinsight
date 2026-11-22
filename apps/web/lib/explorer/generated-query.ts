import { connect, type FullResult } from '@tidbcloud/serverless';
import { enforceSQLPolicy, validateAnalyticsGrants } from '@ossinsight/sql-policy';
import { normalizeRows } from './query';

export const EXPLORER_RESULT_LIMIT = 100;
const DATABASE_TIMEOUT_MS = 5_000;
const REQUEST_TIMEOUT_MS = 15_000;

/** The model never uses the application's question/history credentials. */
export async function executeGeneratedExplorerPlan(statement: string, signal?: AbortSignal) {
  // One extra row tells the caller whether the visible result was truncated.
  const sql = enforceSQLPolicy(statement, { maxRows: EXPLORER_RESULT_LIMIT + 1 });
  const url = process.env.EXPLORER_ANALYTICS_DATABASE_URL;
  const database = process.env.EXPLORER_ANALYTICS_DATABASE;
  if (!url || !database) {
    throw new Error('Explorer analytics credentials and database must be configured separately.');
  }

  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
  const timeout = setTimeout(() => controller.abort(new Error('Explorer request timed out.')), REQUEST_TIMEOUT_MS);

  try {
    controller.signal.throwIfAborted();
    const connection = connect({
      url,
      database,
      // Aborting transport does not prove that a database query was cancelled;
      // the separate server-side execution limit bounds the generated SELECT.
      fetch: (input, init) => fetch(input, { ...init, signal: controller.signal }),
    });
    const execute = async (query: string): Promise<FullResult> => {
      controller.signal.throwIfAborted();
      return await connection.execute(query, null, { fullResult: true }) as FullResult;
    };
    const selectedDatabase = await execute('SELECT DATABASE() AS databaseName');
    const databaseRow = selectedDatabase.rows?.[0];
    if (!databaseRow || Array.isArray(databaseRow) || databaseRow.databaseName !== database) {
      throw new Error('Explorer analytics database does not match the configured database.');
    }
    const grants = await execute('SHOW GRANTS FOR CURRENT_USER');
    validateAnalyticsGrants(database, (grants.rows ?? []).map(row => String(Object.values(row)[0])));
    // Match the MySQL parser's string/identifier semantics before executing its
    // serialized output (in particular, no NO_BACKSLASH_ESCAPES or ANSI_QUOTES).
    await execute(`SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION', SESSION max_execution_time = ${DATABASE_TIMEOUT_MS}`);
    const timeoutState = await execute('SELECT @@SESSION.max_execution_time AS maxExecutionTime, @@SESSION.sql_mode AS sqlMode');
    const timeoutRow = timeoutState.rows?.[0];
    if (!timeoutRow || Array.isArray(timeoutRow) || Number(timeoutRow.maxExecutionTime) !== DATABASE_TIMEOUT_MS) {
      throw new Error('Explorer database execution limit was not applied.');
    }
    const modes = String(timeoutRow.sqlMode).split(',').sort().join(',');
    if (modes !== 'NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES') {
      throw new Error('Explorer database SQL mode does not match the authorization parser.');
    }
    const result = await execute(sql);
    const explanation = await execute(`EXPLAIN FORMAT = 'brief' ${sql}`);
    return {
      sql,
      queryResult: { types: result.types ?? {}, rows: normalizeRows(result) },
      explainResult: { rows: normalizeRows(explanation) },
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
