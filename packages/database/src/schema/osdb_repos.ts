/**
 * osdb_repos schema
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

export const osdbRepos = mysqlTable(
  'osdb_repos',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
    groupName: varchar('groupName', { length: 255 }),
  },
  (table) => ({
  })
);

// Type inference
export type OsdbRepos = typeof osdbRepos.$inferSelect;
export type NewOsdbRepos = typeof osdbRepos.$inferInsert;
