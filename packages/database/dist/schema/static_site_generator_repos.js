/**
 * static_site_generator_repos schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const staticSiteGeneratorRepos = mysqlTable('static_site_generator_repos', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
}, (table) => ({}));
//# sourceMappingURL=static_site_generator_repos.js.map