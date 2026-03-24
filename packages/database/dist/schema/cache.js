/**
 * cache schema
 */
import { mysqlTable, varchar, datetime, json, } from 'drizzle-orm/mysql-core';
export const cache = mysqlTable('cache', {
    cache_key: varchar('cacheKey', { length: 512 }).primaryKey(),
    cache_value: json('cacheValue'),
    created_at: datetime('createdAt', { mode: 'string', fsp: 3 }),
    updated_at: datetime('updatedAt', { mode: 'string', fsp: 3 }),
    expires: varchar('expires', { length: 11 }).default('-1').notNull(),
}, (table) => ({}));
//# sourceMappingURL=cache.js.map