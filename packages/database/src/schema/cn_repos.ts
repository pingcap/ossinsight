/**
 * cn_repos schema
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

export const cnRepos = mysqlTable(
  'cn_repos',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
    company: varchar('company', { length: 255 }),
  },
  (table) => ({
  })
);

// Type inference
export type CnRepos = typeof cnRepos.$inferSelect;
export type NewCnRepos = typeof cnRepos.$inferInsert;
