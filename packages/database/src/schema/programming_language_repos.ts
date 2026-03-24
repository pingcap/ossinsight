/**
 * programming_language_repos schema
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

export const programmingLanguageRepos = mysqlTable(
  'programming_language_repos',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
  },
  (table) => ({
  })
);

// Type inference
export type ProgrammingLanguageRepos = typeof programmingLanguageRepos.$inferSelect;
export type NewProgrammingLanguageRepos = typeof programmingLanguageRepos.$inferInsert;
