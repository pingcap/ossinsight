/**
 * github_repo_languages schema
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

export const githubRepoLanguages = mysqlTable(
  'github_repo_languages',
  {
    repo_id: varchar('repoId', { length: 11 }).primaryKey(),
    language: varchar('language', { length: 32 }).primaryKey(),
    size: varchar('size', { length: 20 }),
  },
  (table) => ({
  })
);

// Type inference
export type GithubRepoLanguages = typeof githubRepoLanguages.$inferSelect;
export type NewGithubRepoLanguages = typeof githubRepoLanguages.$inferInsert;
