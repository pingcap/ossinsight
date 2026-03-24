/**
 * repo_milestones schema
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

export const repoMilestones = mysqlTable(
  'repo_milestones',
  {
    id: varchar('id', { length: 20 }).primaryKey(),
    repoId: varchar('repoId', { length: 11 }),
    milestoneTypeId: varchar('milestoneTypeId', { length: 11 }),
    milestoneNumber: varchar('milestoneNumber', { length: 11 }),
    payload: json('payload'),
    createdAt: datetime('createdAt', { mode: 'string', fsp: 3 }),
  },
  (table) => ({
    indexRmOnRepoIdMilestoneTypeNumber: uniqueIndex('index_rm_on_repo_id_milestone_type_number').on(table.repoId, table.milestoneTypeId, table.milestoneNumber),
  })
);

// Type inference
export type RepoMilestones = typeof repoMilestones.$inferSelect;
export type NewRepoMilestones = typeof repoMilestones.$inferInsert;
