import {
  enforceSQLPolicy as enforce,
  positiveId as parsePositiveId,
  SQLPolicyError,
  SQLPolicy,
} from '@ossinsight/sql-policy';
import { BadParamsError } from '../runner/query/QueryParser';

export { PUBLIC_ANALYTICS_TABLES, SQLPolicy } from '@ossinsight/sql-policy';

// Preserve the API server's existing parameter-error contract.
function apiPolicy<T>(operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    if (error instanceof SQLPolicyError) throw new BadParamsError('playground', error.message);
    throw error;
  }
}

export function positiveId(value: unknown): number {
  return apiPolicy(() => parsePositiveId(value));
}

export function enforceSQLPolicy(sql: string, policy: SQLPolicy = {}): string {
  return apiPolicy(() => enforce(sql, policy));
}
