/**
 * GitHub Events Schema
 * 
 * Migrated from Ruby ETL (etl/app/models/github_event.rb)
 * Table: github_events
 */

import {
  mysqlTable,
  bigint,
  varchar,
  int,
  datetime,
  date,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';

export const githubEvents = mysqlTable(
  'github_events',
  {
    // Primary key
    id: bigint('id', { mode: 'number' }).default(0).notNull().primaryKey(),

    // Basic event fields
    type: varchar('type', { length: 29 }).default('Event').notNull(),
    actorId: bigint('actor_id', { mode: 'number' }).default(0).notNull(),
    actorLogin: varchar('actor_login', { length: 40 }).default('').notNull(),
    repoId: bigint('repo_id', { mode: 'number' }).default(0).notNull(),
    repoName: varchar('repo_name', { length: 140 }).default('').notNull(),
    orgId: bigint('org_id', { mode: 'number' }).default(0).notNull(),
    orgLogin: varchar('org_login', { length: 40 }).default('').notNull(),
    createdAt: datetime('created_at', { mode: 'string', fsp: 3 }).default('1970-01-01 00:00:00').notNull(),

    // Parsed payload fields
    language: varchar('language', { length: 26 }).default('').notNull(),
    additions: bigint('additions', { mode: 'number' }).default(0).notNull(),
    deletions: bigint('deletions', { mode: 'number' }).default(0).notNull(),
    action: varchar('action', { length: 11 }).default('').notNull(),
    number: int('number').default(0).notNull(),
    commitId: varchar('commit_id', { length: 40 }).default('').notNull(),
    commentId: bigint('comment_id', { mode: 'number' }).default(0).notNull(),
    state: varchar('state', { length: 6 }).default('').notNull(),
    closedAt: datetime('closed_at', { mode: 'string', fsp: 3 }).default('1970-01-01 00:00:00').notNull(),
    comments: int('comments').default(0).notNull(),
    prMerged: boolean('pr_merged').default(false).notNull(),
    prMergedAt: datetime('pr_merged_at', { mode: 'string', fsp: 3 }).default('1970-01-01 00:00:00').notNull(),
    prChangedFiles: int('pr_changed_files').default(0).notNull(),
    prReviewComments: int('pr_review_comments').default(0).notNull(),
    prOrIssueId: bigint('pr_or_issue_id', { mode: 'number' }).default(0).notNull(),
    pushSize: int('push_size').default(0).notNull(),
    pushDistinctSize: int('push_distinct_size').default(0).notNull(),
    creatorUserId: bigint('creator_user_id', { mode: 'number' }).default(0).notNull(),
    creatorUserLogin: varchar('creator_user_login', { length: 40 }).default('').notNull(),
    prOrIssueCreatedAt: datetime('pr_or_issue_created_at', { mode: 'string', fsp: 3 }).default('1970-01-01 00:00:00').notNull(),

    // Computed date fields
    eventDay: date('event_day', { mode: 'string' }).notNull(),
    eventMonth: date('event_month', { mode: 'string' }).notNull(),
    eventYear: int('event_year').notNull(),
  },
  // Indexes (matching Ruby ETL)
  (table) => ({
    idxActorLogin: index('idx_actor_login').on(table.actorLogin),
    idxRepoName: index('idx_repo_name').on(table.repoName),
    idxCreatedAt: index('idx_created_at').on(table.createdAt),
    idxEventDay: index('idx_event_day').on(table.eventDay),
    
    // Composite indexes
    idxActorIdTypeAction: index('idx_actor_id_type_action').on(
      table.actorId,
      table.type,
      table.action,
      table.createdAt,
      table.repoId,
      table.pushDistinctSize
    ),
    idxCreatorIdTypeAction: index('idx_creator_id_type_action').on(
      table.creatorUserId,
      table.type,
      table.action,
      table.prMerged,
      table.createdAt,
      table.additions,
      table.deletions
    ),
    idxOrgIdTypeAction: index('idx_org_id_type_action').on(
      table.orgId,
      table.type,
      table.action,
      table.createdAt,
      table.number,
      table.pushDistinctSize,
      table.pushSize
    ),
    idxOrgIdTypeActionMonth: index('idx_org_id_type_action_month').on(
      table.orgId,
      table.type,
      table.action,
      table.eventMonth,
      table.actorLogin
    ),
    idxRepoIdTypeAction: index('idx_repo_id_type_action').on(
      table.repoId,
      table.type,
      table.action,
      table.createdAt,
      table.number,
      table.pushDistinctSize,
      table.pushSize
    ),
    idxRepoIdTypeActionMonth: index('idx_repo_id_type_action_month').on(
      table.repoId,
      table.type,
      table.action,
      table.eventMonth,
      table.actorLogin
    ),
    idxRepoIdTypeActionMerged: index('idx_repo_id_type_action_merged').on(
      table.repoId,
      table.type,
      table.action,
      table.prMerged,
      table.createdAt,
      table.additions,
      table.deletions
    ),
    idxOrgIdTypeActionMerged: index('idx_org_id_type_action_merged').on(
      table.orgId,
      table.type,
      table.action,
      table.prMerged,
      table.createdAt,
      table.additions,
      table.deletions
    ),
  })
);

// Type inference
export type GithubEvent = typeof githubEvents.$inferSelect;
export type NewGithubEvent = typeof githubEvents.$inferInsert;
