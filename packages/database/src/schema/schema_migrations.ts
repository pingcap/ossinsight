/**
 * schema_migrations schema
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

export const schemaMigrations = mysqlTable(
  'schema_migrations',
  {
    version: varchar('version', { length: 255 }).primaryKey(),
  },
  (table) => ({
  })
);

// Type inference
export type SchemaMigrations = typeof schemaMigrations.$inferSelect;
export type NewSchemaMigrations = typeof schemaMigrations.$inferInsert;
