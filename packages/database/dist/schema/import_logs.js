/**
 * import_logs schema
 *
 * Migrated from: packages/api-server/__tests__/migrations/gharchive_dev.import_logs-schema.sql
 */
import { mysqlTable, bigint, varchar, datetime, index, } from 'drizzle-orm/mysql-core';
export const importLogs = mysqlTable('import_logs', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    filename: varchar('filename', { length: 255 }).notNull(),
    localFile: varchar('local_file', { length: 255 }),
    startDownloadAt: datetime('start_download_at', { mode: 'string', fsp: 3 }),
    endDownloadAt: datetime('end_download_at', { mode: 'string', fsp: 3 }),
    startImportAt: datetime('start_import_at', { mode: 'string', fsp: 3 }),
    endImportAt: datetime('end_import_at', { mode: 'string', fsp: 3 }),
    startBatchAt: datetime('start_batch_at', { mode: 'string', fsp: 3 }),
    createdAt: datetime('created_at', { mode: 'string', fsp: 3 }).notNull(),
    updatedAt: datetime('updated_at', { mode: 'string', fsp: 3 }).notNull(),
}, (table) => ({
    indexImportLogsOnFilename: index('index_import_logs_on_filename').on(table.filename),
}));
//# sourceMappingURL=import_logs.js.map