/**
 * github_repos schema
 */
import { mysqlTable, varchar, boolean, timestamp, index, } from 'drizzle-orm/mysql-core';
export const githubRepos = mysqlTable('github_repos', {
    repo_id: varchar('repoId', { length: 11 }).primaryKey(),
    repo_name: varchar('repoName', { length: 150 }),
    owner_id: varchar('ownerId', { length: 11 }),
    owner_login: varchar('ownerLogin', { length: 255 }),
    owner_is_org: boolean('ownerIsOrg'),
    description: varchar('description', { length: 512 }),
    primary_language: varchar('primaryLanguage', { length: 32 }),
    license: varchar('license', { length: 32 }),
    size: varchar('size', { length: 20 }),
    stars: varchar('stars', { length: 11 }),
    forks: varchar('forks', { length: 11 }),
    parent_repo_id: varchar('parentRepoId', { length: 11 }),
    is_fork: boolean('isFork'),
    is_archived: boolean('isArchived'),
    is_deleted: boolean('isDeleted'),
    latest_released_at: timestamp('latestReleasedAt', { mode: 'string', fsp: 3 }),
    pushed_at: timestamp('pushedAt', { mode: 'string', fsp: 3 }),
    created_at: timestamp('createdAt', { mode: 'string', fsp: 3 }),
    updated_at: timestamp('updatedAt', { mode: 'string', fsp: 3 }),
    last_event_at: timestamp('lastEventAt', { mode: 'string', fsp: 3 }),
    refreshed_at: timestamp('refreshedAt', { mode: 'string', fsp: 3 }),
}, (table) => ({
    index_gr_on_owner_id: index('index_gr_on_owner_id').on(table.owner_id),
    index_gr_on_repo_name: index('index_gr_on_repo_name').on(table.repo_name),
    index_gr_on_stars: index('index_gr_on_stars').on(table.stars),
    index_gr_on_repo_id_repo_name: index('index_gr_on_repo_id_repo_name').on(table.repo_id, table.repo_name),
    index_gr_on_created_at_is_deleted: index('index_gr_on_created_at_is_deleted').on(table.created_at, table.is_deleted),
    index_gr_on_owner_login_owner_id_is_deleted: index('index_gr_on_owner_login_owner_id_is_deleted').on(table.owner_login, table.owner_id, table.is_deleted),
}));
//# sourceMappingURL=github_repos.js.map