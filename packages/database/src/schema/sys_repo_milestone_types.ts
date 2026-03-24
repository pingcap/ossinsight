/**
 * sys_repo_milestone_types schema
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

export const sysRepoMilestoneTypes = mysqlTable(
  'sys_repo_milestone_types',
  {
    id: varchar('id', { length: 11 }).primaryKey(),
    name: varchar('name', { length: 30 }),
  },
  (table) => ({
  })
);

// Type inference
export type SysRepoMilestoneTypes = typeof sysRepoMilestoneTypes.$inferSelect;
export type NewSysRepoMilestoneTypes = typeof sysRepoMilestoneTypes.$inferInsert;
