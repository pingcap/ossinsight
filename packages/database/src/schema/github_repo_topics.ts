/**
 * github_repo_topics schema
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

export const githubRepoTopics = mysqlTable(
  'github_repo_topics',
  {
    repo_id: varchar('repoId', { length: 11 }).primaryKey(),
    topic: varchar('topic', { length: 50 }).primaryKey(),
  },
  (table) => ({
  })
);

// Type inference
export type GithubRepoTopics = typeof githubRepoTopics.$inferSelect;
export type NewGithubRepoTopics = typeof githubRepoTopics.$inferInsert;
