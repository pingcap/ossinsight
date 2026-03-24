/**
 * sys_sent_repo_milestones schema
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

export const sysSentRepoMilestones = mysqlTable(
  'sys_sent_repo_milestones',
  {
    userId: varchar('userId', { length: 11 }).primaryKey(),
    repoMilestoneId: varchar('repoMilestoneId', { length: 11 }).primaryKey(),
    sentAt: datetime('sentAt', { mode: 'string', fsp: 3 }),
    sysSentRepoMilestonesUserIdFkey: varchar('sysSentRepoMilestonesUserIdFkey', { length: 255 }).notNull(),
  },
  (table) => ({
  })
);

// Type inference
export type SysSentRepoMilestones = typeof sysSentRepoMilestones.$inferSelect;
export type NewSysSentRepoMilestones = typeof sysSentRepoMilestones.$inferInsert;
