/**
 * trending_repos schema
 */
export declare const trendingRepos: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "trending_repos";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "trending_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        repoName: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repoName";
            tableName: "trending_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        createdAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "createdAt";
            tableName: "trending_repos";
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
export type TrendingRepos = typeof trendingRepos.$inferSelect;
export type NewTrendingRepos = typeof trendingRepos.$inferInsert;
//# sourceMappingURL=trending_repos.d.ts.map