/**
 * collection_items schema
 */
export declare const collectionItems: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "collection_items";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "collection_items";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        collection_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "collectionId";
            tableName: "collection_items";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        repo_name: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repoName";
            tableName: "collection_items";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        repo_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repoId";
            tableName: "collection_items";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        last_month_rank: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "lastMonthRank";
            tableName: "collection_items";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        last_2ndMonthRank: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "last_2ndMonthRank";
            tableName: "collection_items";
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
export type CollectionItems = typeof collectionItems.$inferSelect;
export type NewCollectionItems = typeof collectionItems.$inferInsert;
//# sourceMappingURL=collection_items.d.ts.map