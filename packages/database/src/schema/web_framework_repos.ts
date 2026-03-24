/**
 * web_framework_repos schema
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

export const webFrameworkRepos = mysqlTable(
  'web_framework_repos',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
  },
  (table) => ({
  })
);

// Type inference
export type WebFrameworkRepos = typeof webFrameworkRepos.$inferSelect;
export type NewWebFrameworkRepos = typeof webFrameworkRepos.$inferInsert;
