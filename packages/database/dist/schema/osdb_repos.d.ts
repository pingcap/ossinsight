/**
 * osdb_repos schema
 */
export declare const osdbRepos: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "osdb_repos";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "osdb_repos";
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
            tableName: "osdb_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        groupName: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "groupName";
            tableName: "osdb_repos";
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
export type OsdbRepos = typeof osdbRepos.$inferSelect;
export type NewOsdbRepos = typeof osdbRepos.$inferInsert;
//# sourceMappingURL=osdb_repos.d.ts.map