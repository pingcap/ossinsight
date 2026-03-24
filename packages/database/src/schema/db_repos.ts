/**
 * db_repos schema
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

export const dbRepos = mysqlTable(
  'db_repos',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
  },
  (table) => ({
  })
);

// Type inference
export type DbRepos = typeof dbRepos.$inferSelect;
export type NewDbRepos = typeof dbRepos.$inferInsert;
