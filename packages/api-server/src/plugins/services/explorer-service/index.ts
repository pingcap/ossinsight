import fp from "fastify-plugin";
import {Queue} from "bullmq";
import {APIError, ValidateSQLError} from "../../../utils/error";
import {Connection, ResultSetHeader} from "mysql2/promise";
import crypto from "node:crypto";
import {DateTime} from "luxon";
import {AST, Parser, Select} from "node-sql-parser";
import {BotService, RecommendedChart} from "../bot-service";
import {PlanStep, Question, QuestionQueryResult, QuestionStatus, ValidateSQLResult} from "./types";
import {QueryPlaygroundSQLPromptTemplate} from "../bot-service/template/QueryPlaygroundPromptTemplate";
import {pino} from "pino";
import {TiDBPlaygroundQueryExecutor} from "../../../core/executor/query-executor/TiDBPlaygroundQueryExecutor";
import {GenerateChartPromptTemplate} from "../bot-service/template/GenerateChartPromptTemplate";
import {randomUUID} from "crypto";

declare module 'fastify' {
    interface FastifyInstance {
        explorerService: ExplorerService;
    }
}

declare module "node-sql-parser" {
    interface Select {
        _next?: AST;
        union?: string;
    }
}

export default fp(async (app) => {
    app.decorate('explorerService', new ExplorerService(
      app.log.child({service: 'explorer-service'}),
      app.botService,
      app.playgroundQueryExecutor,
      app.explorerHighConcurrentQueue,
      app.explorerLowConcurrentQueue,
    ));
}, {
    name: '@ossinsight/explorer-service',
    dependencies: [
        '@fastify/env',
        'fastify-redis',
        '@ossinsight/bot-service',
        '@ossinsight/explorer-high-concurrent-queue',
        '@ossinsight/explorer-low-concurrent-queue'
    ]
});

export class ExplorerService {
    // TODO: replace node-sql-parser with tidb-sql-parser.
    private sqlParser: Parser;
    private readonly generateSQLTemplate: QueryPlaygroundSQLPromptTemplate;
    private readonly generateChartTemplate: GenerateChartPromptTemplate;
    private maxSelectLimit = 10;

    constructor(
        private readonly logger: pino.BaseLogger,
        private readonly botService: BotService,
        private readonly playgroundQueryExecutor: TiDBPlaygroundQueryExecutor,
        private readonly highConcurrentQueue: Queue,
        private readonly lowConcurrentQueue: Queue
    ) {
        this.sqlParser = new Parser();
        this.generateSQLTemplate = new QueryPlaygroundSQLPromptTemplate();
        this.generateChartTemplate = new GenerateChartPromptTemplate();
    }

    async countUserTodayQuestions(conn: Connection, userId: number): Promise<number> {
        const [rows] = await conn.query<any[]>(`
            SELECT COUNT(*) AS count
            FROM explorer_questions
            WHERE user_id = ? AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 DAY) AND NOW()) 
        `, [userId]);
        return rows.length;
    }

    async newQuestion(conn: Connection, userId: number, q: string): Promise<Question> {
        const normalizedQuestion = this.normalizeQuestion(q);
        const questionHash = this.getQuestionHash(normalizedQuestion);

        // Check if the question is cached.
        const cachedQuestion = await this.getQuestionByHash(conn, questionHash);
        if (cachedQuestion) {
            return cachedQuestion;
        }

        // Generate the SQL by OpenAI.
        const querySQL = await this.botService.questionToSQL(this.generateSQLTemplate, normalizedQuestion, {});
        if (!querySQL) {
            throw new APIError(500, 'Failed to generate SQL, please try again later.');
        }

        // Validate the generated SQL.
        let sql, statementType;
        try {
            const res = this.validateSQL(querySQL);
            sql = res.sql;
            statementType = res.statementType;
        } catch (err) {
            if (err instanceof APIError) {
                throw new ValidateSQLError(500, `Failed to validate the generated SQL: ${err.message}`, querySQL);
            } else {
                throw new ValidateSQLError(500, 'Failed to validate the generated SQL', querySQL);
            }
        }

        // Get the storage engines that will be used in the SQL execution.
        let engines: string[] = [];
        if (statementType === 'select') {
            try {
                const plan = await this.getSQLExecutionPlan(conn, sql);
                engines = this.getStorageEnginesFromPlan(plan);
            } catch (err: any) {
                if (err.sqlMessage) {
                    throw new ValidateSQLError(500, `Failed to create the execution plan for the generated SQL: ${err.sqlMessage}`, querySQL);
                } else {
                    throw new ValidateSQLError(500, `Failed to create the execution plan for the generated SQL`, querySQL);
                }
            }
        }

        // Create a new question.
        const questionId = randomUUID();
        const question: Question = {
            id: questionId,
            hash: questionHash,
            userId: userId,
            status: QuestionStatus.New,
            title: q,
            querySQL: sql,
            queryHash: this.getQueryHash(sql),
            engines: engines,
            recommended: false,
            createdAt: DateTime.utc(),
            requestedAt: DateTime.utc()
        }
        await this.createQuestion(conn, question);

        // Get result from cache.
        const cachedResult = await this.getCachedSQLResult(conn, question.queryHash);
        if (cachedResult) {
            await this.saveQuestionResult(conn, questionId, cachedResult);
            return {
                ...question,
                ...cachedResult,
                status: QuestionStatus.Success,
            }
        }

        // Push the question to the queue.
        const useTiFlash = engines.includes('tiflash');
        let job;
        if (useTiFlash) {
            job = await this.lowConcurrentQueue.add("", question);
        } else {
            job = await this.highConcurrentQueue.add("", question);
        }

        // Update the question status.
        if (job.id) {
            question.status = QuestionStatus.Waiting;
            question.queueJobId = job.id;
            await this.updateQuestionStatusAndJobId(conn, question.id, QuestionStatus.Waiting, job.id);
        }

        return question;
    }

    private normalizeQuestion(question: string): string {
        return question.replaceAll(/\s+/g, ' ');
    }

    private validateSQL(sql: string): ValidateSQLResult {
        // Notice: node-sql-parser doesn't support `SHOW INDEXES FROM` syntax.
        if (/^show\s+indexes\s+from\s+\S+/igm.test(sql)) {
            return {
                sql: sql,
                statementType: 'show',
            };
        }

        if (/rand\(.*\)/ig.test(sql)) {
            throw new APIError(400, 'didn\'t support SQL contains `rand()` function');
        }

        try {
            const ast = this.sqlParser.astify(sql);
            let rootNode;
            if (Array.isArray(ast)) {
                if (ast.length > 1) {
                    throw new APIError(400, 'didn\'t support multiple statements');
                } else {
                    rootNode = ast[0];
                }
            } else {
                rootNode = ast;
            }

            switch (rootNode.type.toLowerCase()) {
                case 'select':
                    const newAst = this.addLimitToSQL(rootNode as Select, this.maxSelectLimit, 0);
                    const newSQL = this.sqlParser.sqlify(newAst);
                    return {
                        sql: newSQL,
                        statementType: 'select',
                    }
                case 'show':
                case 'desc':
                    return {
                        sql: sql,
                        statementType: rootNode.type
                    };
                default:
                    throw new APIError(400, 'only supports SELECT, SHOW and DESC statements');
            }
        } catch (err: any) {
            if (err instanceof APIError) {
                throw err;
            }

            throw new APIError(400, err.message);
        }
    }

    private addLimitToSQL(rootNode: Select, maxLimit: number, depth: number): Select {
        const { limit } = rootNode;

        // Add limit
        if (limit && Array.isArray(limit.value)) {
            if (limit.value.length === 1) {
                if (limit.value[0].value > maxLimit) {
                    limit.value[0].value = maxLimit;
                }
            } else if (limit.value.length === 2) {
                if (limit.value[1].value > maxLimit) {
                    limit.value[1].value = maxLimit;
                }
            }
        } else {
            rootNode.limit = {
                seperator: "",
                value: [
                    {
                        type: "number",
                        value: maxLimit,
                    },
                ],
            };
        }

        return rootNode;
    }

    async getSQLExecutionPlan(conn: Connection, sql: string) {
        const [rows] = await conn.query<any[]>('explain format = "brief" ' + sql);
        return rows;
    }

    getStorageEnginesFromPlan(steps: PlanStep[]):string[] {
        if (!Array.isArray(steps)) return [];

        const engines = new Set<string>();
        for (const step of steps) {
            if (step.task.includes('tiflash')) {
                engines.add('tiflash');
            } else if (step.task.includes('tikv')) {
                engines.add('tikv');
            }
        }

        const engineValues = [];
        for (const engine of engines) {
            engineValues.push(engine);
        }

        return engineValues;
    }

    private getQueryHash(sql: string): string {
        sql.replaceAll(/\s+/g, ' ');
        return crypto.createHash('sha256').update(sql, 'binary').digest('hex');
    }

    private getQuestionHash(sql: string): string {
        sql.replaceAll(/\s+/g, ' ');
        return crypto.createHash('sha256').update(sql, 'binary').digest('hex');
    }

    private async createQuestion(conn: Connection, question: Question) {
        const { id, hash, userId, status, title, querySQL, queryHash, engines = [], recommended, createdAt } = question;
        const enginesValue = JSON.stringify(engines);
        const [rs] = await conn.query<ResultSetHeader>(`
            INSERT INTO explorer_questions(
                id, hash, user_id, status, title, query_sql, query_hash, engines, recommended, created_at
            ) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, hash, userId, status, title, querySQL, queryHash, enginesValue, recommended, createdAt.toSQL()
        ]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to create a new question.');
        }
    }

    private async updateQuestionStatusAndJobId(conn: Connection, questionId: string, status: QuestionStatus, jobId: string) {
        const [rs] = await conn.query<ResultSetHeader>(`
            UPDATE explorer_questions SET status = ?, queue_job_id = ? WHERE id = UUID_TO_BIN(?)
        `, [status, jobId, questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question status.');
        }
    }

    async getQuestionById(conn: Connection, questionId: string): Promise<Question | null> {
        const [rows] = await conn.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, query_sql AS querySQL, query_hash AS queryHash, engines, 
                queue_job_id AS queueJobId, result, chart, recommended, created_at AS createdAt, requested_at AS requestedAt, 
                executed_at AS executedAt, finished_at AS finishedAt, spent, error
            FROM explorer_questions
            WHERE id = UUID_TO_BIN(?)
        `, [questionId]);
        if (rows.length !== 1) {
            return null;
        }
        return this.mapRecordToQuestion(rows[0]);
    }

    async getQuestionByHash(conn: Connection, questionHash: string): Promise<Question | null> {
        const [rows] = await conn.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, query_sql AS querySQL, query_hash AS queryHash, engines, 
                queue_job_id AS queueJobId, result, chart, recommended, created_at AS createdAt, requested_at AS requestedAt, 
                executed_at AS executedAt, finished_at AS finishedAt, spent, error
            FROM explorer_questions
            WHERE hash = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [questionHash]);
        if (rows.length !== 1) {
            return null;
        }
        return this.mapRecordToQuestion(rows[0]);
    }

    async getLatestQuestionByQueryHash(conn: Connection, queryHash: string): Promise<Question | null> {
        const [rows] = await conn.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, query_sql AS querySQL, query_hash AS queryHash, engines, 
                queue_job_id AS queueJobId, result, chart, recommended, created_at AS createdAt, requested_at AS requestedAt, 
                executed_at AS executedAt, finished_at AS finishedAt, spent, error
            FROM explorer_questions
            WHERE query_hash = ? AND status = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [queryHash, QuestionStatus.Success]);
        if (rows.length !== 1) {
            return null;
        }
        return this.mapRecordToQuestion(rows[0]);
    }

    async getCachedSQLResult(conn: Connection, queryHash: string): Promise<QuestionQueryResult | null> {
        const question = await this.getLatestQuestionByQueryHash(conn, queryHash);
        if (!question) {
            return null;
        }
        return {
            result: question.result!,
            executedAt: question.executedAt!,
            finishedAt: question.finishedAt!,
            spent: question.spent!,
        }
    }

    mapRecordToQuestion(row: any): Question {
        return {
            ...row,
            recommended: row.recommended === 1,
            createdAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.createdAt) : undefined,
            requestedAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.requestedAt) : undefined,
            executedAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.executedAt) : undefined,
            finishedAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.finishedAt) : undefined,
        }
    }

    async resolveQuestion(conn: Connection, question: Question) {
        const { id: questionId, querySQL } = question;
        try {
            const result = await this.executeQuery(questionId, querySQL);
            await this.saveQuestionResult(conn, questionId, result);
        } catch (err: any) {
            await this.saveQuestionError(conn, questionId, err);
        }
    }

    private async executeQuery(questionId: string, querySQL: string): Promise<QuestionQueryResult> {
        // Get playground connection.
        const getConnStart = DateTime.now();
        const playgroundConn = await this.playgroundQueryExecutor.getConnection();
        const getConnEnd = DateTime.now();
        this.logger.info({ questionId }, `Got the playground connection, cost: ${getConnEnd.diff(getConnStart).as('milliseconds')} ms`);

        try {
            this.logger.info({ questionId }, 'Start executing query.');
            const executedAt = DateTime.now();
            const [rows, fields] = await playgroundConn.execute<any[]>(querySQL);
            const finishedAt = DateTime.now();
            const spent = finishedAt.diff(executedAt).as("seconds");
            this.logger.info({ questionId }, 'Finished query executing, cost: %d s', spent);

            return {
                result: {
                    fields: fields.map((field) => {
                        return {
                            name: field.name,
                            columnType: field.type,
                        }
                    }),
                    rows
                },
                executedAt,
                finishedAt,
                spent,
            }
        } finally {
            playgroundConn.release();
        }
    }

    private async saveQuestionResult(conn: Connection, questionId: string, questionResult: QuestionQueryResult) {
        const { result, executedAt, finishedAt, spent } = questionResult;
        const [rs] = await conn.query<ResultSetHeader>(`
            UPDATE explorer_questions
            SET status = ?, result = ?, executed_at = ?, finished_at = ?, spent = ?
            WHERE id = UUID_TO_BIN(?)
        `, [
            QuestionStatus.Success,
            JSON.stringify(result),
            executedAt.toSQL(),
            finishedAt.toSQL(),
            spent,
            questionId
        ]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to save the question result.');
        }
    }

    private async saveQuestionError(conn: Connection, questionId: string, err: Error) {
        const [rs] = await conn.query<ResultSetHeader>(`
            UPDATE explorer_questions SET status = ?, error = ? WHERE id = UUID_TO_BIN(?)
        `, [QuestionStatus.Error, err.message, questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question error.');
        }
    }

    async generateChartForQuestion(conn: Connection, questionId: string) {
        const question = await this.getQuestionById(conn, questionId);
        if (!question) {
            throw new APIError(404, 'Question not found.');
        }
        if (question.status !== QuestionStatus.Success || !question.result) {
            throw new APIError(409, 'Question is not finished.');
        }

        const { id, title, result: { rows } } = question;
        const sampleData = rows.slice(0, 2);

        const chart = await this.botService.dataToChart(this.generateChartTemplate, title, sampleData);
        if (chart) {
            await this.saveQuestionChart(conn, id, chart);
        }

        return chart;
    }

    private async saveQuestionChart(conn: Connection, questionId: string, chart: RecommendedChart) {
        const [rs] = await conn.query<ResultSetHeader>(`
            UPDATE explorer_questions SET chart = ? WHERE id = UUID_TO_BIN(?)
        `, [JSON.stringify(chart), questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question chart.');
        }
    }

}
