/**
 * nocode_repos schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const nocodeRepos = mysqlTable('nocode_repos', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
}, (table) => ({}));
//# sourceMappingURL=nocode_repos.js.map