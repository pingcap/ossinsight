/**
 * nocode_repos schema
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

export const nocodeRepos = mysqlTable(
  'nocode_repos',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
  },
  (table) => ({
  })
);

// Type inference
export type NocodeRepos = typeof nocodeRepos.$inferSelect;
export type NewNocodeRepos = typeof nocodeRepos.$inferInsert;
