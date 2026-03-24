/**
 * cn_orgs schema
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

export const cnOrgs = mysqlTable(
  'cn_orgs',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
    company: varchar('company', { length: 255 }),
  },
  (table) => ({
  })
);

// Type inference
export type CnOrgs = typeof cnOrgs.$inferSelect;
export type NewCnOrgs = typeof cnOrgs.$inferInsert;
