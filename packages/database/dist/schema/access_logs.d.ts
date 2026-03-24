/**
 * access_logs schema
 */
export declare const accessLogs: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "access_logs";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "access_logs";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        remote_addr: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "remoteAddr";
            tableName: "access_logs";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        origin: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "origin";
            tableName: "access_logs";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        status_code: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "statusCode";
            tableName: "access_logs";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        request_path: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "requestPath";
            tableName: "access_logs";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        request_params: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "requestParams";
            tableName: "access_logs";
            dataType: "json";
            columnType: "MySqlJson";
            data: unknown;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        requested_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "requestedAt";
            tableName: "access_logs";
            dataType: "string";
            columnType: "MySqlDateTimeString";
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
export type AccessLogs = typeof accessLogs.$inferSelect;
export type NewAccessLogs = typeof accessLogs.$inferInsert;
//# sourceMappingURL=access_logs.d.ts.map