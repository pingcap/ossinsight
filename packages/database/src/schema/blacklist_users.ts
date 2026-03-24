/**
 * blacklist_users schema
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

export const blacklistUsers = mysqlTable(
  'blacklist_users',
  {
    login: varchar('login', { length: 255 }).primaryKey(),
  },
  (table) => ({
    blacklist_users_login_uindex: uniqueIndex('blacklist_users_login_uindex').on(table.login),
  })
);

// Type inference
export type BlacklistUsers = typeof blacklistUsers.$inferSelect;
export type NewBlacklistUsers = typeof blacklistUsers.$inferInsert;
