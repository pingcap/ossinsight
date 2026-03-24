/**
 * schema_migrations schema
 */
import { mysqlTable, varchar, } from 'drizzle-orm/mysql-core';
export const schemaMigrations = mysqlTable('schema_migrations', {
    version: varchar('version', { length: 255 }).primaryKey(),
}, (table) => ({}));
//# sourceMappingURL=schema_migrations.js.map