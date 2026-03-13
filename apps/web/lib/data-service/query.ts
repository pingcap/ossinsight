import type { ExecuteArgs, FullResult } from '@tidbcloud/serverless';
import { BIG_NUMBER_TYPES } from './executor/utils';
import { createTiDBConnection } from './connection';

const tidb = createTiDBConnection();

export type QueryRows = Record<string, any>[];

export async function executeSQL(
  statement: string,
  args: ExecuteArgs = null,
  signal?: AbortSignal,
) {
  const result = await tidb.execute(statement, args, {
    fullResult: true,
  }) as FullResult;
  signal?.throwIfAborted();
  return result;
}

export async function executeRows(
  statement: string,
  args: ExecuteArgs = null,
  signal?: AbortSignal,
) {
  const result = await executeSQL(statement, args, signal);
  return {
    statement: result.statement,
    types: result.types ?? {},
    rows: normalizeRows(result),
  };
}

export async function executeOneRow<T extends Record<string, any>>(
  statement: string,
  args: ExecuteArgs = null,
  signal?: AbortSignal,
) {
  const { rows } = await executeRows(statement, args, signal);
  return rows[0] as T | undefined;
}

function normalizeRows(result: FullResult): QueryRows {
  return (result.rows ?? []).map((row: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        if (result.types && BIG_NUMBER_TYPES.includes(result.types[key])) {
          return [key, Number(value)];
        }
        return [key, value];
      }),
    );
  });
}
