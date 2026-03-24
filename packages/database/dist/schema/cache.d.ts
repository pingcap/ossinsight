/**
 * cache schema
 */
export declare const cache: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "cache";
    schema: undefined;
    columns: {
        cache_key: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "cacheKey";
            tableName: "cache";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        cache_value: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "cacheValue";
            tableName: "cache";
            dataType: "json";
            columnType: "MySqlJson";
            data: unknown;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        created_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "createdAt";
            tableName: "cache";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        updated_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "updatedAt";
            tableName: "cache";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        expires: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "expires";
            tableName: "cache";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type Cache = typeof cache.$inferSelect;
export type NewCache = typeof cache.$inferInsert;
//# sourceMappingURL=cache.d.ts.map