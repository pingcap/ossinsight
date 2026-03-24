/**
 * db_repos schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const dbRepos = mysqlTable('db_repos', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
}, (table) => ({}));
//# sourceMappingURL=db_repos.js.map