/**
 * event_logs schema
 */
export declare const eventLogs: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "event_logs";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "event_logs";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        created_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "createdAt";
            tableName: "event_logs";
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
export type EventLogs = typeof eventLogs.$inferSelect;
export type NewEventLogs = typeof eventLogs.$inferInsert;
//# sourceMappingURL=event_logs.d.ts.map