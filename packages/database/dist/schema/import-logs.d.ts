/**
 * Import Logs Schema
 *
 * Track ETL import job status
 * Table: import_logs
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
        start_batch_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "start_batch_at";
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
        start_download_at: import("drizzle-orm/mysql-core").MySqlColumn<{
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
        end_download_at: import("drizzle-orm/mysql-core").MySqlColumn<{
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
        start_import_at: import("drizzle-orm/mysql-core").MySqlColumn<{
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
        end_import_at: import("drizzle-orm/mysql-core").MySqlColumn<{
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
        status: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "status";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        error_message: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "error_message";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        created_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "created_at";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        updated_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "updated_at";
            tableName: "import_logs";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type ImportLog = typeof importLogs.$inferSelect;
export type NewImportLog = typeof importLogs.$inferInsert;
//# sourceMappingURL=import-logs.d.ts.map