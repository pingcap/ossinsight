/**
 * explorer_questions schema
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

export const explorerQuestions = mysqlTable(
  'explorer_questions',
  {
    id: varchar('id', { length: 16 }).primaryKey(),
    hash: varchar('hash', { length: 128 }),
    user_id: varchar('userId', { length: 11 }),
    status: varchar('status', { length: 255 }),
    title: varchar('title', { length: 255 }),
    query_sql: text('query_sql'),
    query_hash: varchar('queryHash', { length: 128 }),
    engines: json('engines'),
    queue_name: varchar('queueName', { length: 255 }),
    queue_job_id: varchar('queueJobId', { length: 128 }),
    recommended_questions: json('recommendedQuestions'),
    result: json('result'),
    chart: json('chart'),
    recommended: boolean('recommended'),
    hit_cache: boolean('hitCache'),
    created_at: datetime('createdAt', { mode: 'string', fsp: 3 }),
    requested_at: datetime('requestedAt', { mode: 'string', fsp: 3 }).notNull(),
    executed_at: datetime('executedAt', { mode: 'string', fsp: 3 }),
    finished_at: datetime('finishedAt', { mode: 'string', fsp: 3 }),
    spent: varchar('spent', { length: 255 }),
    error: varchar('error', { length: 512 }),
  },
  (table) => ({
    idx_eq_on_user_id_created_at: index('idx_eq_on_user_id_created_at').on(table.user_id, table.created_at),
  })
);

// Type inference
export type ExplorerQuestions = typeof explorerQuestions.$inferSelect;
export type NewExplorerQuestions = typeof explorerQuestions.$inferInsert;
