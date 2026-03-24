/**
 * stats_query_summary schema
 */
export declare const statsQuerySummary: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "stats_query_summary";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "stats_query_summary";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        queryName: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "queryName";
            tableName: "stats_query_summary";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        digest_text: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "digest_text";
            tableName: "stats_query_summary";
            dataType: "string";
            columnType: "MySqlText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        executedAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "executedAt";
            tableName: "stats_query_summary";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type StatsQuerySummary = typeof statsQuerySummary.$inferSelect;
export type NewStatsQuerySummary = typeof statsQuerySummary.$inferInsert;
//# sourceMappingURL=stats_query_summary.d.ts.map