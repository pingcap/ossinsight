import { connect } from "@tidbcloud/serverless";
import type { ExecuteArgs, FullResult } from "@tidbcloud/serverless";

import { BIG_NUMBER_TYPES } from "@/lib/data-service/executor/utils";

export function getExplorerDatabaseUrl() {
  return process.env.EXPLORER_DATABASE_URL || "";
}

export function getExplorerDatabase() {
  return process.env.EXPLORER_DATABASE || process.env.OSSINSIGHT_DATABASE || "gharchive_dev";
}

function createExplorerConnection() {
  const url = getExplorerDatabaseUrl();
  if (!url) {
    throw new Error(
      "Missing EXPLORER_DATABASE_URL for Data Explorer.",
    );
  }

  return connect({
    url,
    database: getExplorerDatabase(),
  });
}

export async function executeExplorerSQL(
  statement: string,
  args: ExecuteArgs = null,
) {
  const connection = createExplorerConnection();
  return connection.execute(statement, args, {
    fullResult: true,
  }) as Promise<FullResult>;
}

export async function executeExplorerRows(
  statement: string,
  args: ExecuteArgs = null,
  _signal?: AbortSignal,
) {
  const result = await executeExplorerSQL(statement, args);

  return {
    statement: result.statement,
    types: result.types ?? {},
    rows: normalizeRows(result),
  };
}

export async function explainExplorerRows(
  statement: string,
  args: ExecuteArgs = null,
) {
  const result = await executeExplorerSQL(`EXPLAIN FORMAT = 'brief' ${statement}`, args);

  return {
    statement: result.statement,
    types: result.types ?? {},
    rows: normalizeRows(result),
  };
}

function normalizeRows(result: FullResult) {
  return (result.rows ?? []).map((row: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        if (result.types && BIG_NUMBER_TYPES.includes(result.types[key])) {
          return [key, Number(value)];
        }

        return [key, value];
      }),
    ),
  );
}
