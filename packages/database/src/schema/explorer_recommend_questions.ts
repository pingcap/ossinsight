/**
 * explorer_recommend_questions schema
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

export const explorerRecommendQuestions = mysqlTable(
  'explorer_recommend_questions',
  {
    hash: varchar('hash', { length: 128 }).primaryKey(),
    title: varchar('title', { length: 255 }),
    ai_generated: boolean('aiGenerated'),
  },
  (table) => ({
  })
);

// Type inference
export type ExplorerRecommendQuestions = typeof explorerRecommendQuestions.$inferSelect;
export type NewExplorerRecommendQuestions = typeof explorerRecommendQuestions.$inferInsert;
