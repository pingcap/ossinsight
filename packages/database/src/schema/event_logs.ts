/**
 * event_logs schema
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

export const eventLogs = mysqlTable(
  'event_logs',
  {
    id: varchar('id', { length: 20 }).primaryKey(),
    created_at: datetime('createdAt', { mode: 'string', fsp: 3 }),
  },
  (table) => ({
    index_event_logs_on_created_at: index('index_event_logs_on_created_at').on(table.created_at),
  })
);

// Type inference
export type EventLogs = typeof eventLogs.$inferSelect;
export type NewEventLogs = typeof eventLogs.$inferInsert;
