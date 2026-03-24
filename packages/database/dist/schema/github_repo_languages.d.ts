/**
 * github_repo_languages schema
 */
export declare const githubRepoLanguages: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "github_repo_languages";
    schema: undefined;
    columns: {
        repo_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repoId";
            tableName: "github_repo_languages";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        language: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "language";
            tableName: "github_repo_languages";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        size: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "size";
            tableName: "github_repo_languages";
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
export type GithubRepoLanguages = typeof githubRepoLanguages.$inferSelect;
export type NewGithubRepoLanguages = typeof githubRepoLanguages.$inferInsert;
//# sourceMappingURL=github_repo_languages.d.ts.map