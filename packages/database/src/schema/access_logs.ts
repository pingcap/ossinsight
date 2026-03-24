/**
 * access_logs schema
 */

import {
  mysqlTable,
  bigint,
  int,
  varchar,
  text,
  boolean,
  timestamp,
  datetime,
  date,
  json,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';

export const accessLogs = mysqlTable(
  'access_logs',
  {
    id: varchar('id', { length: 20 }).primaryKey(),
    remote_addr: varchar('remoteAddr', { length: 128 }),
    origin: varchar('origin', { length: 128 }),
    status_code: varchar('statusCode', { length: 11 }),
    request_path: varchar('requestPath', { length: 256 }),
    request_params: json('requestParams'),
    requested_at: datetime('requestedAt', { mode: 'string', fsp: 3 }),
  },
  (table) => ({
    index_al_on_requested_at: index('index_al_on_requested_at').on(table.requested_at),
  })
);

// Type inference
export type AccessLogs = typeof accessLogs.$inferSelect;
export type NewAccessLogs = typeof accessLogs.$inferInsert;
