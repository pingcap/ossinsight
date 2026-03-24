/**
 * collections schema
 */
export declare const collections: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "collections";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "collections";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        name: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "name";
            tableName: "collections";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        public: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "public";
            tableName: "collections";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        past_month_visits: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "pastMonthVisits";
            tableName: "collections";
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type Collections = typeof collections.$inferSelect;
export type NewCollections = typeof collections.$inferInsert;
//# sourceMappingURL=collections.d.ts.map