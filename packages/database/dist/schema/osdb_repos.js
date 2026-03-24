/**
 * osdb_repos schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const osdbRepos = mysqlTable('osdb_repos', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
    groupName: varchar('groupName', { length: 255 }),
}, (table) => ({}));
//# sourceMappingURL=osdb_repos.js.map