/**
 * import_logs schema
 *
 * Migrated from: packages/api-server/__tests__/migrations/gharchive_dev.import_logs-schema.sql
 */
export declare const importLogs: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "import_logs";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "import_logs";
            dataType: "number";
            columnType: "MySqlBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        filename: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "filename";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        localFile: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "local_file";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        startDownloadAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "start_download_at";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        endDownloadAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "end_download_at";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        startImportAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "start_import_at";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        endImportAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "end_import_at";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        startBatchAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "start_batch_at";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        createdAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "created_at";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        updatedAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "updated_at";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type ImportLog = typeof importLogs.$inferSelect;
export type NewImportLog = typeof importLogs.$inferInsert;
//# sourceMappingURL=import_logs.d.ts.map