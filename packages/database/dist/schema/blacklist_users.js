/**
 * blacklist_users schema
 */
import { mysqlTable, varchar, uniqueIndex, } from 'drizzle-orm/mysql-core';
export const blacklistUsers = mysqlTable('blacklist_users', {
    login: varchar('login', { length: 255 }).primaryKey(),
}, (table) => ({
    blacklist_users_login_uindex: uniqueIndex('blacklist_users_login_uindex').on(table.login),
}));
//# sourceMappingURL=blacklist_users.js.map