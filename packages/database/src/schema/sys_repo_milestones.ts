/**
 * sys_repo_milestones schema
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

export const sysRepoMilestones = mysqlTable(
  'sys_repo_milestones',
  {
    id: varchar('id', { length: 20 }).primaryKey(),
    repoId: varchar('repoId', { length: 11 }),
    milestoneTypeId: varchar('milestoneTypeId', { length: 11 }),
    milestoneNumber: varchar('milestoneNumber', { length: 11 }),
    payload: json('payload'),
    reachedAt: datetime('reachedAt', { mode: 'string', fsp: 3 }),
  },
  (table) => ({
    indexRmOnRepoIdMilestoneTypeNumber: uniqueIndex('index_rm_on_repo_id_milestone_type_number').on(table.repoId, table.milestoneTypeId, table.milestoneNumber),
  })
);

// Type inference
export type SysRepoMilestones = typeof sysRepoMilestones.$inferSelect;
export type NewSysRepoMilestones = typeof sysRepoMilestones.$inferInsert;
