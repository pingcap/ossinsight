/**
 * sys_subscribed_repos schema
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

export const sysSubscribedRepos = mysqlTable(
  'sys_subscribed_repos',
  {
    userId: varchar('userId', { length: 11 }).primaryKey(),
    repoId: varchar('repoId', { length: 11 }).primaryKey(),
    subscribedAt: datetime('subscribedAt', { mode: 'string', fsp: 3 }),
    subscribed: varchar('subscribed', { length: 1 }),
    fkSsrOnUserId: varchar('fkSsrOnUserId', { length: 255 }).notNull(),
    fkSsrOnRepoId: varchar('fkSsrOnRepoId', { length: 255 }).notNull(),
  },
  (table) => ({
  })
);

// Type inference
export type SysSubscribedRepos = typeof sysSubscribedRepos.$inferSelect;
export type NewSysSubscribedRepos = typeof sysSubscribedRepos.$inferInsert;
