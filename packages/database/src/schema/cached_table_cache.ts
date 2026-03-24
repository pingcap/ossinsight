/**
 * cached_table_cache schema
 */

import {
  mysqlTable,
  bigint,
  int,
  varchar,
  text,
  boolean,
  timestamp,
  datetime,
  date,
  json,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';

export const cachedTableCache = mysqlTable(
  'cached_table_cache',
  {
    cache_key: varchar('cacheKey', { length: 512 }).primaryKey(),
    cache_value: json('cacheValue'),
    created_at: datetime('createdAt', { mode: 'string', fsp: 3 }),
    updated_at: datetime('updatedAt', { mode: 'string', fsp: 3 }),
    expires: varchar('expires', { length: 11 }).default('-1').notNull(),
  },
  (table) => ({
  })
);

// Type inference
export type CachedTableCache = typeof cachedTableCache.$inferSelect;
export type NewCachedTableCache = typeof cachedTableCache.$inferInsert;
