/**
 * sys_accounts schema
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

export const sysAccounts = mysqlTable(
  'sys_accounts',
  {
    id: varchar('id', { length: 11 }).primaryKey(),
    userId: varchar('userId', { length: 11 }),
    provider: varchar('provider', { length: 20 }),
    providerAccountId: varchar('providerAccountId', { length: 128 }),
    providerAccountLogin: varchar('providerAccountLogin', { length: 128 }),
    accessToken: varchar('accessToken', { length: 255 }),
    fkSaOnUserId: varchar('fkSaOnUserId', { length: 255 }).notNull(),
  },
  (table) => ({
    indexSaOnUserIdProviderAccountId: uniqueIndex('index_sa_on_user_id_provider_account_id').on(table.userId, table.provider, table.providerAccountId),
  })
);

// Type inference
export type SysAccounts = typeof sysAccounts.$inferSelect;
export type NewSysAccounts = typeof sysAccounts.$inferInsert;
