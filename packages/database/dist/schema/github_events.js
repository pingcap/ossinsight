/**
 * github_events schema
 *
 * Migrated from: packages/api-server/__tests__/migrations/gharchive_dev.github_events-schema.sql
 */
import { mysqlTable, bigint, int, varchar, boolean, datetime, date, index, } from 'drizzle-orm/mysql-core';
export const githubEvents = mysqlTable('github_events', {
    id: bigint('id', { mode: 'number' }).default(0).notNull(),
    type: varchar('type', { length: 29 }).default('Event').notNull(),
    created_at: datetime('created_at', { mode: 'string', fsp: 3 }).default('1970-01-01 00:00:00').notNull(),
    repo_id: bigint('repo_id', { mode: 'number' }).default(0).notNull(),
    repo_name: varchar('repo_name', { length: 140 }).default('').notNull(),
    actor_id: bigint('actor_id', { mode: 'number' }).default(0).notNull(),
    actor_login: varchar('actor_login', { length: 40 }).default('').notNull(),
    language: varchar('language', { length: 26 }).default('').notNull(),
    additions: bigint('additions', { mode: 'number' }).default(0).notNull(),
    deletions: bigint('deletions', { mode: 'number' }).default(0).notNull(),
    action: varchar('action', { length: 11 }).default('').notNull(),
    number: int('number').default(0).notNull(),
    commit_id: varchar('commit_id', { length: 40 }).default('').notNull(),
    comment_id: bigint('comment_id', { mode: 'number' }).default(0).notNull(),
    org_login: varchar('org_login', { length: 40 }).default('').notNull(),
    org_id: bigint('org_id', { mode: 'number' }).default(0).notNull(),
    state: varchar('state', { length: 6 }).default('').notNull(),
    closed_at: datetime('closed_at', { mode: 'string', fsp: 3 }).default('1970-01-01 00:00:00').notNull(),
    comments: int('comments').default(0).notNull(),
    pr_merged_at: datetime('pr_merged_at', { mode: 'string', fsp: 3 }).default('1970-01-01 00:00:00').notNull(),
    pr_merged: boolean('pr_merged').default(false).notNull(),
    pr_changed_files: int('pr_changed_files').default(0).notNull(),
    pr_review_comments: int('pr_review_comments').default(0).notNull(),
    pr_or_issue_id: bigint('pr_or_issue_id', { mode: 'number' }).default(0).notNull(),
    event_day: date('event_day', { mode: 'string' }).notNull(),
    event_month: date('event_month', { mode: 'string' }).notNull(),
    event_year: int('event_year').notNull(),
    push_size: int('push_size').default(0).notNull(),
    push_distinct_size: int('push_distinct_size').default(0).notNull(),
    creator_user_login: varchar('creator_user_login', { length: 40 }).default('').notNull(),
    creator_user_id: bigint('creator_user_id', { mode: 'number' }).default(0).notNull(),
    pr_or_issue_created_at: datetime('pr_or_issue_created_at', { mode: 'string', fsp: 3 }).default('1970-01-01 00:00:00').notNull(),
}, (table) => ({
    // Indexes (exactly matching production database)
    index_github_events_on_id: index('index_github_events_on_id').on(table.id),
    index_github_events_on_actor_login: index('index_github_events_on_actor_login').on(table.actor_login),
    index_github_events_on_created_at: index('index_github_events_on_created_at').on(table.created_at),
    index_github_events_on_repo_name: index('index_github_events_on_repo_name').on(table.repo_name),
    index_github_events_on_repo_id_type_action_month_actor_login: index('index_github_events_on_repo_id_type_action_month_actor_login').on(table.repo_id, table.type, table.action, table.event_month, table.actor_login),
    index_ge_on_repo_id_type_action_pr_merged_created_at_add_del: index('index_ge_on_repo_id_type_action_pr_merged_created_at_add_del').on(table.repo_id, table.type, table.action, table.pr_merged, table.created_at, table.additions, table.deletions),
    index_ge_on_creator_id_type_action_merged_created_at_add_del: index('index_ge_on_creator_id_type_action_merged_created_at_add_del').on(table.creator_user_id, table.type, table.action, table.pr_merged, table.created_at, table.additions, table.deletions),
    index_ge_on_actor_id_type_action_created_at_repo_id_commits: index('index_ge_on_actor_id_type_action_created_at_repo_id_commits').on(table.actor_id, table.type, table.action, table.created_at, table.repo_id, table.push_distinct_size),
    index_ge_on_repo_id_type_action_created_at_number_pdsize_psize: index('index_ge_on_repo_id_type_action_created_at_number_pdsize_psize').on(table.repo_id, table.type, table.action, table.created_at, table.number, table.push_distinct_size, table.push_size),
    index_ge_on_repo_id_type_action_created_at_actor_login: index('index_ge_on_repo_id_type_action_created_at_actor_login').on(table.repo_id, table.type, table.action, table.created_at, table.actor_login),
}));
//# sourceMappingURL=github_events.js.map