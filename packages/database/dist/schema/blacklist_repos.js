/**
 * blacklist_repos schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const blacklistRepos = mysqlTable('blacklist_repos', {
    name: varchar('name', { length: 255 }),
}, (table) => ({}));
//# sourceMappingURL=blacklist_repos.js.map