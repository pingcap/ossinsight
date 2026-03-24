/**
 * stats_index_summary schema
 */
export declare const statsIndexSummary: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "stats_index_summary";
    schema: undefined;
    columns: {
        summaryBeginTime: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "summaryBeginTime";
            tableName: "stats_index_summary";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        summaryEndTime: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "summaryEndTime";
            tableName: "stats_index_summary";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        tableName: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "tableName";
            tableName: "stats_index_summary";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        indexName: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "indexName";
            tableName: "stats_index_summary";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        digest: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "digest";
            tableName: "stats_index_summary";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        planDigest: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "planDigest";
            tableName: "stats_index_summary";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        execCount: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "execCount";
            tableName: "stats_index_summary";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type StatsIndexSummary = typeof statsIndexSummary.$inferSelect;
export type NewStatsIndexSummary = typeof statsIndexSummary.$inferInsert;
//# sourceMappingURL=stats_index_summary.d.ts.map