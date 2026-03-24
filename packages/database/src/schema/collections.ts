/**
 * collections schema
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

export const collections = mysqlTable(
  'collections',
  {
    id: varchar('id', { length: 20 }).primaryKey(),
    name: varchar('name', { length: 255 }),
    public: boolean('public').default(true).notNull(),
    past_month_visits: int('pastMonthVisits').notNull(),
  },
  (table) => ({
    index_collections_on_name: uniqueIndex('index_collections_on_name').on(table.name),
  })
);

// Type inference
export type Collections = typeof collections.$inferSelect;
export type NewCollections = typeof collections.$inferInsert;
