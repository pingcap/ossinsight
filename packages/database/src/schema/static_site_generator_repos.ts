/**
 * static_site_generator_repos schema
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

export const staticSiteGeneratorRepos = mysqlTable(
  'static_site_generator_repos',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
  },
  (table) => ({
  })
);

// Type inference
export type StaticSiteGeneratorRepos = typeof staticSiteGeneratorRepos.$inferSelect;
export type NewStaticSiteGeneratorRepos = typeof staticSiteGeneratorRepos.$inferInsert;
