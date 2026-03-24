/**
 * ar_internal_metadata schema
 */
export declare const arInternalMetadata: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "ar_internal_metadata";
    schema: undefined;
    columns: {
        key: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "key";
            tableName: "ar_internal_metadata";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        value: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "value";
            tableName: "ar_internal_metadata";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        created_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "createdAt";
            tableName: "ar_internal_metadata";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        updated_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "updatedAt";
            tableName: "ar_internal_metadata";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type ArInternalMetadata = typeof arInternalMetadata.$inferSelect;
export type NewArInternalMetadata = typeof arInternalMetadata.$inferInsert;
//# sourceMappingURL=ar_internal_metadata.d.ts.map