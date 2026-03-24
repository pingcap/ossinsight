/**
 * trending_repos schema
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

export const trendingRepos = mysqlTable(
  'trending_repos',
  {
    id: varchar('id', { length: 20 }).primaryKey(),
    repoName: varchar('repoName', { length: 255 }),
    createdAt: datetime('createdAt', { mode: 'string', fsp: 3 }),
  },
  (table) => ({
    indexTrendingReposOnRepoName: index('index_trending_repos_on_repo_name').on(table.repoName),
    indexTrendingReposOnCreatedAt: index('index_trending_repos_on_created_at').on(table.createdAt),
  })
);

// Type inference
export type TrendingRepos = typeof trendingRepos.$inferSelect;
export type NewTrendingRepos = typeof trendingRepos.$inferInsert;
