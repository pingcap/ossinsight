/**
 * github_repo_topics schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const githubRepoTopics = mysqlTable('github_repo_topics', {
    repo_id: varchar('repoId', { length: 11 }).primaryKey(),
    topic: varchar('topic', { length: 50 }).primaryKey(),
}, (table) => ({}));
//# sourceMappingURL=github_repo_topics.js.map