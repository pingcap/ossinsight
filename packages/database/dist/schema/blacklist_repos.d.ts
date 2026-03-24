/**
 * blacklist_repos schema
 */
export declare const blacklistRepos: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "blacklist_repos";
    schema: undefined;
    columns: {
        name: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "name";
            tableName: "blacklist_repos";
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
export type BlacklistRepos = typeof blacklistRepos.$inferSelect;
export type NewBlacklistRepos = typeof blacklistRepos.$inferInsert;
//# sourceMappingURL=blacklist_repos.d.ts.map