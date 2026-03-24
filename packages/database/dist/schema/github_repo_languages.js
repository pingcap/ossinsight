/**
 * github_repo_languages schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const githubRepoLanguages = mysqlTable('github_repo_languages', {
    repo_id: varchar('repoId', { length: 11 }).primaryKey(),
    language: varchar('language', { length: 32 }).primaryKey(),
    size: varchar('size', { length: 20 }),
}, (table) => ({}));
//# sourceMappingURL=github_repo_languages.js.map