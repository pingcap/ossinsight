/**
 * Import Logs Schema
 * 
 * Track ETL import job status
 * Table: import_logs
 */

import {
  mysqlTable,
  bigint,
  varchar,
  text,
  datetime,
  timestamp,
  index,
} from 'drizzle-orm/mysql-core';

export const importLogs = mysqlTable(
  'import_logs',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    filename: varchar('filename', { length: 255 }).notNull(),
    startBatchAt: datetime('start_batch_at', { mode: 'string', fsp: 3 }).notNull(),
    startDownloadAt: datetime('start_download_at', { mode: 'string', fsp: 3 }),
    endDownloadAt: datetime('end_download_at', { mode: 'string', fsp: 3 }),
    startImportAt: datetime('start_import_at', { mode: 'string', fsp: 3 }),
    endImportAt: datetime('end_import_at', { mode: 'string', fsp: 3 }),
    status: varchar('status', { length: 50 }).default('pending'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow(),
  },
  (table) => ({
    idxFilename: index('idx_filename').on(table.filename),
    idxStatus: index('idx_status').on(table.status),
    idxCreatedAt: index('idx_created_at').on(table.createdAt),
  })
);

// Type inference
export type ImportLog = typeof importLogs.$inferSelect;
export type NewImportLog = typeof importLogs.$inferInsert;
