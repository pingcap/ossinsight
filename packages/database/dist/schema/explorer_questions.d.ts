/**
 * explorer_questions schema
 */
export declare const explorerQuestions: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "explorer_questions";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        hash: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "hash";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        user_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "userId";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        status: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "status";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        title: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "title";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        query_sql: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "query_sql";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        query_hash: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "queryHash";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        engines: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "engines";
            tableName: "explorer_questions";
            dataType: "json";
            columnType: "MySqlJson";
            data: unknown;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        queue_name: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "queueName";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        queue_job_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "queueJobId";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        recommended_questions: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "recommendedQuestions";
            tableName: "explorer_questions";
            dataType: "json";
            columnType: "MySqlJson";
            data: unknown;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        result: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "result";
            tableName: "explorer_questions";
            dataType: "json";
            columnType: "MySqlJson";
            data: unknown;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        chart: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "chart";
            tableName: "explorer_questions";
            dataType: "json";
            columnType: "MySqlJson";
            data: unknown;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        recommended: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "recommended";
            tableName: "explorer_questions";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        hit_cache: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "hitCache";
            tableName: "explorer_questions";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        created_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "createdAt";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        requested_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "requestedAt";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        executed_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "executedAt";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        finished_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "finishedAt";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        spent: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "spent";
            tableName: "explorer_questions";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        error: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "error";
            tableName: "explorer_questions";
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
export type ExplorerQuestions = typeof explorerQuestions.$inferSelect;
export type NewExplorerQuestions = typeof explorerQuestions.$inferInsert;
//# sourceMappingURL=explorer_questions.d.ts.map