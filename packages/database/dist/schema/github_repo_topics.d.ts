/**
 * github_repo_topics schema
 */
export declare const githubRepoTopics: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "github_repo_topics";
    schema: undefined;
    columns: {
        repo_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repoId";
            tableName: "github_repo_topics";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        topic: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "topic";
            tableName: "github_repo_topics";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type GithubRepoTopics = typeof githubRepoTopics.$inferSelect;
export type NewGithubRepoTopics = typeof githubRepoTopics.$inferInsert;
//# sourceMappingURL=github_repo_topics.d.ts.map