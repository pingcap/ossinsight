import { QueryOptions } from "mysql2";

export type InternalQueryOptions = Pick<QueryOptions, 'sql' | 'rowsAsArray'>;

export function parseQueryOptions (sql: string | InternalQueryOptions, values: any[]): QueryOptions {
  if (typeof sql === 'string') {
    return {
      sql,
      values,
    }
  } else {
    return {
      ...sql,
      values,
    }
  }
}
