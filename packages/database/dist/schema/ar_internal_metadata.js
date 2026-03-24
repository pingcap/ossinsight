/**
 * ar_internal_metadata schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const arInternalMetadata = mysqlTable('ar_internal_metadata', {
    key: varchar('key', { length: 255 }).primaryKey(),
    value: varchar('value', { length: 255 }),
    created_at: varchar('createdAt', { length: 6 }),
    updated_at: varchar('updatedAt', { length: 6 }),
}, (table) => ({}));
//# sourceMappingURL=ar_internal_metadata.js.map