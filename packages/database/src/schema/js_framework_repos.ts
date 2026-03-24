/**
 * js_framework_repos schema
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

export const jsFrameworkRepos = mysqlTable(
  'js_framework_repos',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
  },
  (table) => ({
  })
);

// Type inference
export type JsFrameworkRepos = typeof jsFrameworkRepos.$inferSelect;
export type NewJsFrameworkRepos = typeof jsFrameworkRepos.$inferInsert;
