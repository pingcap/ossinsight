/**
 * import_logs schema
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

export const importLogs = mysqlTable(
  'import_logs',
  {
    id: varchar('id', { length: 20 }).primaryKey(),
    filename: varchar('filename', { length: 255 }),
    localFile: varchar('localFile', { length: 255 }),
    startDownloadAt: datetime('startDownloadAt', { mode: 'string', fsp: 3 }),
    endDownloadAt: datetime('endDownloadAt', { mode: 'string', fsp: 3 }),
    startImportAt: datetime('startImportAt', { mode: 'string', fsp: 3 }),
    endImportAt: datetime('endImportAt', { mode: 'string', fsp: 3 }),
    startBatchAt: datetime('startBatchAt', { mode: 'string', fsp: 3 }),
    createdAt: varchar('createdAt', { length: 6 }),
    updatedAt: varchar('updatedAt', { length: 6 }),
  },
  (table) => ({
    indexImportLogsOnFilename: index('index_import_logs_on_filename').on(table.filename),
  })
);

// Type inference
export type ImportLogs = typeof importLogs.$inferSelect;
export type NewImportLogs = typeof importLogs.$inferInsert;
