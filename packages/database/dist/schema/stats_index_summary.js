/**
 * stats_index_summary schema
 */
import { mysqlTable, varchar, timestamp, uniqueIndex, } from 'drizzle-orm/mysql-core';
export const statsIndexSummary = mysqlTable('stats_index_summary', {
    summaryBeginTime: timestamp('summaryBeginTime', { mode: 'string', fsp: 3 }),
    summaryEndTime: timestamp('summaryEndTime', { mode: 'string', fsp: 3 }),
    tableName: varchar('tableName', { length: 64 }),
    indexName: varchar('indexName', { length: 64 }),
    digest: varchar('digest', { length: 64 }),
    planDigest: varchar('planDigest', { length: 64 }),
    execCount: varchar('execCount', { length: 20 }).notNull(),
}, (table) => ({
    uniqueStsOnBeginEndIndexDigest: uniqueIndex('unique_sts_on_begin_end_index_digest').on(table.summaryBeginTime, table.summaryEndTime, table.indexName, table.digest, table.planDigest),
}));
//# sourceMappingURL=stats_index_summary.js.map