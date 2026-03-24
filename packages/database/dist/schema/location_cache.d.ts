/**
 * location_cache schema
 */
export declare const locationCache: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "location_cache";
    schema: undefined;
    columns: {
        address: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "address";
            tableName: "location_cache";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        valid: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "valid";
            tableName: "location_cache";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        formattedAddress: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "formattedAddress";
            tableName: "location_cache";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        countryCode: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "countryCode";
            tableName: "location_cache";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        regionCode: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "regionCode";
            tableName: "location_cache";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        state: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "state";
            tableName: "location_cache";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        city: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "city";
            tableName: "location_cache";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        longitude: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "longitude";
            tableName: "location_cache";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        latitude: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "latitude";
            tableName: "location_cache";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        provider: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "provider";
            tableName: "location_cache";
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
export type LocationCache = typeof locationCache.$inferSelect;
export type NewLocationCache = typeof locationCache.$inferInsert;
//# sourceMappingURL=location_cache.d.ts.map