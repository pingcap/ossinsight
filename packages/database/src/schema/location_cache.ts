/**
 * location_cache schema
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

export const locationCache = mysqlTable(
  'location_cache',
  {
    address: varchar('address', { length: 255 }).primaryKey(),
    valid: boolean('valid'),
    formattedAddress: varchar('formattedAddress', { length: 255 }),
    countryCode: varchar('countryCode', { length: 3 }),
    regionCode: varchar('regionCode', { length: 3 }),
    state: varchar('state', { length: 255 }),
    city: varchar('city', { length: 255 }),
    longitude: varchar('longitude', { length: 255 }),
    latitude: varchar('latitude', { length: 255 }),
    provider: varchar('provider', { length: 20 }),
  },
  (table) => ({
  })
);

// Type inference
export type LocationCache = typeof locationCache.$inferSelect;
export type NewLocationCache = typeof locationCache.$inferInsert;
