/**
 * blacklist_repos schema
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

export const blacklistRepos = mysqlTable(
  'blacklist_repos',
  {
    name: varchar('name', { length: 255 }),
  },
  (table) => ({
  })
);

// Type inference
export type BlacklistRepos = typeof blacklistRepos.$inferSelect;
export type NewBlacklistRepos = typeof blacklistRepos.$inferInsert;
