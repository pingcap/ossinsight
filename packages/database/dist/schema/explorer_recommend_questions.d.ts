/**
 * explorer_recommend_questions schema
 */
export declare const explorerRecommendQuestions: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "explorer_recommend_questions";
    schema: undefined;
    columns: {
        hash: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "hash";
            tableName: "explorer_recommend_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        title: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "title";
            tableName: "explorer_recommend_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        ai_generated: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "aiGenerated";
            tableName: "explorer_recommend_questions";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type ExplorerRecommendQuestions = typeof explorerRecommendQuestions.$inferSelect;
export type NewExplorerRecommendQuestions = typeof explorerRecommendQuestions.$inferInsert;
//# sourceMappingURL=explorer_recommend_questions.d.ts.map