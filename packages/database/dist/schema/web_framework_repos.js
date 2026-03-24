/**
 * web_framework_repos schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const webFrameworkRepos = mysqlTable('web_framework_repos', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
}, (table) => ({}));
//# sourceMappingURL=web_framework_repos.js.map