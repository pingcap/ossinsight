/**
 * Import Logs Schema
 *
 * Track ETL import job status
 * Table: import_logs
 */
import { mysqlTable, bigint, varchar, text, datetime, timestamp, index, } from 'drizzle-orm/mysql-core';
export const importLogs = mysqlTable('import_logs', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    filename: varchar('filename', { length: 255 }).notNull(),
    start_batch_at: datetime('start_batch_at', { mode: 'string', fsp: 3 }).notNull(),
    start_download_at: datetime('start_download_at', { mode: 'string', fsp: 3 }),
    end_download_at: datetime('end_download_at', { mode: 'string', fsp: 3 }),
    start_import_at: datetime('start_import_at', { mode: 'string', fsp: 3 }),
    end_import_at: datetime('end_import_at', { mode: 'string', fsp: 3 }),
    status: varchar('status', { length: 50 }).default('pending'),
    error_message: text('error_message'),
    created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => ({
    idx_filename: index('idx_filename').on(table.filename),
    idx_status: index('idx_status').on(table.status),
    idx_created_at: index('idx_created_at').on(table.created_at),
}));
//# sourceMappingURL=import-logs.js.map