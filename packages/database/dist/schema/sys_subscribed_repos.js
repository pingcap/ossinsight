/**
 * sys_subscribed_repos schema
 */
import { mysqlTable, varchar, datetime, } from 'drizzle-orm/mysql-core';
export const sysSubscribedRepos = mysqlTable('sys_subscribed_repos', {
    userId: varchar('userId', { length: 11 }).primaryKey(),
    repoId: varchar('repoId', { length: 11 }).primaryKey(),
    subscribedAt: datetime('subscribedAt', { mode: 'string', fsp: 3 }),
    subscribed: varchar('subscribed', { length: 1 }),
    fkSsrOnUserId: varchar('fkSsrOnUserId', { length: 255 }).notNull(),
    fkSsrOnRepoId: varchar('fkSsrOnRepoId', { length: 255 }).notNull(),
}, (table) => ({}));
//# sourceMappingURL=sys_subscribed_repos.js.map