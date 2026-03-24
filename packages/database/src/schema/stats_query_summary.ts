/**
 * stats_query_summary schema
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

export const statsQuerySummary = mysqlTable(
  'stats_query_summary',
  {
    id: varchar('id', { length: 20 }).primaryKey(),
    queryName: varchar('queryName', { length: 128 }),
    digest_text: text('digest_text'),
    executedAt: timestamp('executedAt', { mode: 'string', fsp: 3 }),
  },
  (table) => ({
    indexSqsOnExecutedAt: index('index_sqs_on_executed_at').on(table.executedAt),
  })
);

// Type inference
export type StatsQuerySummary = typeof statsQuerySummary.$inferSelect;
export type NewStatsQuerySummary = typeof statsQuerySummary.$inferInsert;
