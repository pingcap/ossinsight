/**
 * trending_repos schema
 */
import { mysqlTable, varchar, datetime, index, } from 'drizzle-orm/mysql-core';
export const trendingRepos = mysqlTable('trending_repos', {
    id: varchar('id', { length: 20 }).primaryKey(),
    repoName: varchar('repoName', { length: 255 }),
    createdAt: datetime('createdAt', { mode: 'string', fsp: 3 }),
}, (table) => ({
    indexTrendingReposOnRepoName: index('index_trending_repos_on_repo_name').on(table.repoName),
    indexTrendingReposOnCreatedAt: index('index_trending_repos_on_created_at').on(table.createdAt),
}));
//# sourceMappingURL=trending_repos.js.map