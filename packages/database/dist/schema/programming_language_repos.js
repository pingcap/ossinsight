/**
 * programming_language_repos schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const programmingLanguageRepos = mysqlTable('programming_language_repos', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
}, (table) => ({}));
//# sourceMappingURL=programming_language_repos.js.map