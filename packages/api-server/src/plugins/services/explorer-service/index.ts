import fp from "fastify-plugin";
import {Job, Queue} from "bullmq";
import {APIError, ExplorerQuestionError} from "../../../utils/error";
import {Connection, ResultSetHeader} from "mysql2/promise";
import crypto from "node:crypto";
import {DateTime} from "luxon";
import {AST, Parser, Select} from "node-sql-parser";
import {BotService} from "../bot-service";
import {
    PlanStep,
    Question,
    QuestionQueryResult, QuestionQueryResultWithChart,
    QuestionQueueNames,
    QuestionSQLResult,
    QuestionStatus,
    ValidateSQLResult
} from "./types";
import {TiDBPlaygroundQueryExecutor} from "../../../core/executor/query-executor/TiDBPlaygroundQueryExecutor";
import {GenerateChartPromptTemplate} from "../bot-service/template/GenerateChartPromptTemplate";
import {randomUUID} from "crypto";
import {ChartNames, RecommendedChart, RecommendQuestion} from "../bot-service/types";
import {GenerateAnswerPromptTemplate} from "../bot-service/template/GenerateAnswerPromptTemplate";
import {FastifyBaseLogger} from "fastify";

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

export default fp(async (app: any) => {
    app.decorate('explorerService', new ExplorerService(
      app.log.child({service: 'explorer-service'}),
      app.botService,
      app.playgroundQueryExecutor,
      app.explorerLowConcurrentQueue,
      app.explorerHighConcurrentQueue,
      {
          userMaxQuestionsPerHour: app.config.EXPLORER_USER_MAX_QUESTIONS_PER_HOUR,
          userMaxQuestionsOnGoing: app.config.EXPLORER_USER_MAX_QUESTIONS_ON_GOING,
          trustedUsers: app.config.PLAYGROUND_TRUSTED_GITHUB_LOGINS,
          trustedUsersMaxQuestionsPerHour: 200,
          generateSQLCacheTTL: app.config.EXPLORER_GENERATE_SQL_CACHE_TTL,
          querySQLCacheTTL: app.config.EXPLORER_QUERY_SQL_CACHE_TTL
      }
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

export interface ExplorerOption {
    userMaxQuestionsPerHour: number;
    userMaxQuestionsOnGoing: number;
    trustedUsers: string[];
    trustedUsersMaxQuestionsPerHour: number;
    generateSQLCacheTTL: number;
    querySQLCacheTTL: number;
}

export class ExplorerService {
    // TODO: replace node-sql-parser with tidb-sql-parser.
    private sqlParser: Parser;
    private readonly generateAnswerTemplate: GenerateAnswerPromptTemplate;
    private readonly generateChartTemplate: GenerateChartPromptTemplate;
    private maxSelectLimit = 200;
    private options: ExplorerOption;

    constructor(
      private readonly logger: FastifyBaseLogger,
      private readonly botService: BotService,
      private readonly playgroundQueryExecutor: TiDBPlaygroundQueryExecutor,
      private readonly lowConcurrentQueue: Queue,
      private readonly highConcurrentQueue: Queue,
      options?: ExplorerOption
    ) {
        this.sqlParser = new Parser();
        this.generateChartTemplate = new GenerateChartPromptTemplate();
        this.generateAnswerTemplate = new GenerateAnswerPromptTemplate();
        this.options = Object.assign({}, {
            userMaxQuestionsPerHour: 20,
            userMaxQuestionsOnGoing: 3,
            trustedUsers: [],
            trustedUsersMaxQuestionsPerHour: 100,
            generateSQLCacheTTL: 60 * 60 * 24 * 7,
            querySQLCacheTTL: 60 * 60 * 24,
        }, options || {});
    }

    async newQuestion(conn: Connection, userId: number, githubLogin: string, q: string): Promise<Question> {
        const questionId = randomUUID();
        const logger = this.logger.child({ questionId: questionId });
        const normalizedQuestion = this.normalizeQuestion(q);
        logger.info("Creating a new question: %s", normalizedQuestion);
        const questionHash = this.getQuestionHash(normalizedQuestion);
        let question: Question = {
            id: questionId,
            hash: questionHash,
            userId: userId,
            status: QuestionStatus.New,
            title: q,
            recommendedQuestions: [],
            recommended: false,
            createdAt: DateTime.utc(),
            hitCache: false,
        }

        try {
            await conn.beginTransaction();

            // Check if the question is cached.
            const cachedQuestion = await this.getQuestionByHash(conn, questionHash);
            if (cachedQuestion) {
                await conn.commit();
                logger.info("Question is cached, returning cached question (hash: %s).", questionHash);
                return cachedQuestion;
            }

            // Give the trusted users more daily requests.
            let limit = this.options.userMaxQuestionsPerHour;
            if (this.options.trustedUsers.includes(githubLogin)) {
                limit = this.options.trustedUsersMaxQuestionsPerHour;
            }

            // Notice: Using FOR UPDATE, pessimistic locking controls a single user to request question serially.
            const previousQuestions = await this.getUserPastHourQuestionsWithLock(conn, userId);
            if (previousQuestions.length >= limit) {
                throw new APIError(429, 'Too many questions request in the past hour');
            }

            const onGongQuestions = previousQuestions.filter(q => [QuestionStatus.Waiting, QuestionStatus.Running].includes(q.status));
            if (onGongQuestions.length >= this.options.userMaxQuestionsOnGoing) {
                logger.info("There are %d previous question on going, cancel them.", onGongQuestions.length);
                await this.cancelQuestions(conn, onGongQuestions.map(q => q.id));
            }

            // Generate the SQL by OpenAI.
            const answer = await this.botService.questionToAnswer(this.generateAnswerTemplate, normalizedQuestion);
            let { sql: querySQL, chart, questions: recommendedQuestions } = answer;

            // Prepare the recommended questions.
            const templateQuestions = await this.getRecommendQuestions(conn, 3, false);
            recommendedQuestions.push(...templateQuestions.map(q => q.title));
            question.recommendedQuestions = recommendedQuestions;

            // Check if the SQL is generated.
            if (!querySQL) {
                throw new APIError(500, 'Failed to generate SQL, please try again later.');
            }
            question.querySQL = querySQL;
            question.chart = chart;

            // Validate the generated SQL.
            let statementType;
            try {
                logger.info("Validating the generated SQL: %s", querySQL);
                const res = this.validateSQL(querySQL);
                querySQL = res.sql;
                statementType = res.statementType;
            } catch (err) {
                if (err instanceof APIError) {
                    throw new APIError(500, `Failed to validate the generated SQL: ${err.message}`);
                } else {
                    throw new APIError(500, 'Failed to validate the generated SQL');
                }
            }
            question.querySQL = querySQL;
            question.queryHash = this.getQueryHash(querySQL);

            // Get the storage engines that will be used in the SQL execution.
            let engines: string[] = [];
            if (statementType === 'select') {
                try {
                    logger.info("Getting the storage engines for the SQL: %s", querySQL);
                    const plan = await this.getSQLExecutionPlan(conn, querySQL);
                    engines = this.getStorageEnginesFromPlan(plan);
                } catch (err: any) {
                    if (err.sqlMessage) {
                        throw new APIError(500, `Failed to create the execution plan for the generated SQL: ${err.sqlMessage}`);
                    } else {
                        throw new APIError(500, `Failed to create the execution plan for the generated SQL`);
                    }
                }
            }
            question.engines = engines;

            // Create a new question.
            const jobId = randomUUID();
            const useTiFlash = engines.includes('tiflash');
            question.queueName = useTiFlash ? QuestionQueueNames.Low : QuestionQueueNames.High;
            question.queueJobId = jobId;
            question.requestedAt = DateTime.utc();
            question.status = QuestionStatus.Waiting;
            await this.createQuestion(conn, question);

            // Try to get SQL result from cache.
            const cachedResult = await this.getCachedSQLResult(conn, question.queryHash, this.options.querySQLCacheTTL);
            if (cachedResult) {
                logger.info("SQL result is cached, returning cached result (hash: %s).", question.queryHash);
                await this.saveQuestionResult(conn, questionId, cachedResult);
                question = {
                    ...question,
                    ...cachedResult,
                    status: QuestionStatus.Success,
                    hitCache: true,
                }
            }

            await conn.commit();
        } catch (err: any) {
            await conn.rollback();

            // Record the error.
            question = {
                ...question,
                status: QuestionStatus.Error,
                error: err.message,
            };
            await this.createQuestion(conn, question);

            // Wrap the error.
            this.logger.info(err, `Failed to create a new question: ${err.message}`);
            if (err instanceof APIError) {
                throw new ExplorerQuestionError(err.statusCode, err.message, question, err);
            } else {
                throw new ExplorerQuestionError(500, 'Failed to create the question', question);
            }
        }

        // Push the question to the queue.
        const { queueJobId, hitCache, queueName } = question;
        if (!hitCache) {
            if (queueName === QuestionQueueNames.Low) {
                logger.info("Pushing the question to the low concurrent queue (jobId: %s).", queueJobId);
                await this.lowConcurrentQueue.add(QuestionQueueNames.Low, question, {
                    jobId: queueJobId!
                });
            } else {
                logger.info("Pushing the question to the high concurrent queue (jobId: %s).", queueJobId);
                await this.highConcurrentQueue.add(QuestionQueueNames.High, question, {
                    jobId: queueJobId!
                });
            }
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
        const {
            id, hash, userId, status, title, querySQL, queryHash, engines = [],
            recommended, createdAt, queueName, queueJobId = null, chart, recommendedQuestions = [], error = null
        } = question;
        const enginesValue = JSON.stringify(engines);
        const chartValue = chart !== undefined ? JSON.stringify(chart) : null;
        const recommendedQuestionsValue = JSON.stringify(recommendedQuestions);
        const [rs] = await conn.query<ResultSetHeader>(`
            INSERT INTO explorer_questions(
                id, hash, user_id, status, title, query_sql, query_hash, engines, 
                recommended, created_at, queue_name, queue_job_id, chart, recommended_questions, error
            ) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, hash, userId, status, title, querySQL, queryHash, enginesValue,
            recommended, createdAt.toSQL(), queueName, queueJobId, chartValue, recommendedQuestionsValue, error
        ]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to create a new question.');
        }
    }

    private async cancelQuestions(conn: Connection, questionIds: string[]) {
        const [rs] = await conn.query<ResultSetHeader>(`
            UPDATE explorer_questions SET status = ? WHERE id IN (${questionIds.map(() => "UUID_TO_BIN(?)").join(", ")})
        `, [QuestionStatus.Cancel, ...questionIds]);
        if (rs.affectedRows === 0) {
            throw new APIError(500, 'Failed to cancel the question.');
        }
    }

    private async updateQuestionStatus(conn: Connection, questionId: string, status: QuestionStatus) {
        const [rs] = await conn.query<ResultSetHeader>(`
            UPDATE explorer_questions SET status = ? WHERE id = UUID_TO_BIN(?)
        `, [status, questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question status.');
        }
    }

    async getQuestionById(conn: Connection, questionId: string): Promise<Question | null> {
        const [rows] = await conn.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, query_sql AS querySQL, query_hash AS queryHash, engines, 
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions, result, chart, recommended,
                hit_cache AS hitCache, created_at AS createdAt, requested_at AS requestedAt, 
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
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions, result, chart, recommended, 
                hit_cache AS hitCache, created_at AS createdAt, requested_at AS requestedAt,
                executed_at AS executedAt, finished_at AS finishedAt, spent, error
            FROM explorer_questions
            WHERE
                hash = ?
                AND status IN (?)
            ORDER BY created_at DESC
            LIMIT 1
        `, [questionHash, QuestionStatus.Success]);
        if (rows.length !== 1) {
            return null;
        }
        return this.mapRecordToQuestion(rows[0]);
    }

    async getLatestQuestionByQueryHash(conn: Connection, queryHash: string, ttl: number): Promise<Question | null> {
        const [rows] = await conn.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, query_sql AS querySQL, query_hash AS queryHash, engines,
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions, result, chart, recommended, 
                hit_cache AS hitCache, created_at AS createdAt, requested_at AS requestedAt,
                executed_at AS executedAt, finished_at AS finishedAt, spent, error
            FROM explorer_questions
            WHERE query_hash = ? AND status = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
            ORDER BY created_at DESC
            LIMIT 1
        `, [queryHash, QuestionStatus.Success, ttl]);
        if (rows.length !== 1) {
            return null;
        }
        return this.mapRecordToQuestion(rows[0]);
    }

    async getCachedSQLResult(conn: Connection, queryHash: string, ttl: number): Promise<QuestionQueryResultWithChart | null> {
        const question = await this.getLatestQuestionByQueryHash(conn, queryHash, ttl);
        if (!question) {
            return null;
        }
        return {
            result: question.result!,
            executedAt: question.executedAt!,
            finishedAt: question.finishedAt!,
            spent: question.spent!,
            chart: question.chart!,
        }
    }

    async getUserPastHourQuestionsWithLock(conn: Connection, userId: number): Promise<Question[]> {
        const [rows] = await conn.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, query_sql AS querySQL, query_hash AS queryHash, engines,
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions, result, chart, recommended, 
                hit_cache AS hitCache, created_at AS createdAt, requested_at AS requestedAt,
                executed_at AS executedAt, finished_at AS finishedAt, spent, error
            FROM explorer_questions
            WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ORDER BY created_at DESC
            FOR UPDATE
        `, [userId]);
        return rows.map(row => this.mapRecordToQuestion(row));
    }

    mapRecordToQuestion(row: any): Question {
        return {
            ...row,
            recommended: row.recommended === 1,
            hitCache: row.hitCache === 1,
            createdAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.createdAt) : undefined,
            requestedAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.requestedAt) : undefined,
            executedAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.executedAt) : undefined,
            finishedAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.finishedAt) : undefined,
        }
    }

    async countPrecedingQuestions(conn: Connection, questionId: string): Promise<number> {
        const [rows] = await conn.query<any[]>(`
            SELECT COUNT(*) AS count
            FROM explorer_questions eq
            WHERE
                status IN (?)
                AND created_at < (SELECT created_at FROM explorer_questions WHERE id = UUID_TO_BIN(?))
                AND queue_name = (SELECT created_at FROM explorer_questions WHERE id = UUID_TO_BIN(?))
        `, [[QuestionStatus.Running, QuestionStatus.Waiting], questionId, questionId]);
        return rows[0].count;
    }

    async resolveQuestion(conn: Connection, job: Job, question: Question): Promise<QuestionQueryResult> {
        const { id: questionId, querySQL } = question;
        try {
            await this.updateQuestionStatus(conn, questionId, QuestionStatus.Running);
            const questionResult = await this.executeQuery(questionId, querySQL!);
            await this.saveQuestionResult(conn, questionId, {
                ...questionResult,
            });
            return questionResult;
        } catch (err: any) {
            await this.saveQuestionError(conn, questionId, err);
            throw err;
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

    private async saveQuestionResult(conn: Connection, questionId: string, questionResult: QuestionQueryResult, hitCache = false) {
        const { result, executedAt, finishedAt, spent } = questionResult;
        const [rs] = await conn.query<ResultSetHeader>(`
            UPDATE explorer_questions
            SET status = ?, result = ?, executed_at = ?, finished_at = ?, spent = ?, hit_cache = ?
            WHERE id = UUID_TO_BIN(?)
        `, [
            QuestionStatus.Success,
            JSON.stringify(result),
            executedAt.toSQL(),
            finishedAt.toSQL(),
            spent,
            hitCache,
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

    async generateChart(conn: Connection, questionId: string, title: string, result: QuestionSQLResult): Promise<RecommendedChart> {
        const { rows } = result;
        const sampleData = rows.slice(0, 2);

        let chart;
        try {
            // Generate chart according the query result by AI.
            chart = await this.botService.dataToChart(this.generateChartTemplate, title, sampleData);
        } catch (err: any) {
            this.logger.error(err, `Failed to generate chart for question ${questionId}: ${err.message}`);
        } finally {
            if (!chart) {
                chart = {
                    chartName: ChartNames.TABLE,
                    columns: sampleData[0] ? Object.keys(sampleData[0]) : []
                }
            }
        }

        await this.saveQuestionChart(conn, questionId, chart);
        return chart;
    }

    async generateChartByQuestionId(conn: Connection, questionId: string) {
        const question = await this.getQuestionById(conn, questionId);
        if (!question) {
            throw new APIError(404, 'Question not found.');
        }
        if (question.status !== QuestionStatus.Success || !question.result) {
            throw new APIError(409, 'The SQL query to resolve the question has not been finished.');
        }

        const { id, title, result } = question;
        return this.generateChart(conn, id, title, result);
    }

    private async saveQuestionChart(conn: Connection, questionId: string, chart: RecommendedChart) {
        const [rs] = await conn.query<ResultSetHeader>(`
            UPDATE explorer_questions SET chart = ? WHERE id = UUID_TO_BIN(?)
        `, [JSON.stringify(chart), questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question chart.');
        }
    }

    async getRecommendQuestions(conn: Connection, n: number, aiGenerated?: boolean): Promise<RecommendQuestion[]> {
        let questions = [];
        try {
            if (aiGenerated !== undefined) {
                [questions] = await conn.query<any[]>(`
                SELECT hash, title, ai_generated
                FROM explorer_recommend_questions
                WHERE ai_generated = ?
                ORDER BY RAND()
                LIMIT ?
            `, [aiGenerated, n]);
            } else {
                [questions] = await conn.query<any[]>(`
                SELECT hash, title, ai_generated
                FROM explorer_recommend_questions
                ORDER BY RAND()
                LIMIT ?
            `, [n]);
            }
        } catch (err: any) {
            this.logger.error(`Failed to get recommend questions: ${err.message}`);
        }

        return questions;
    }

    async saveRecommendQuestions(conn: Connection, questions: RecommendQuestion[]): Promise<void> {
        const questionValues = questions.filter((q) => {
            return q.title != ''
        }).map(({ hash, title, aiGenerated }) => {
            const hashValue = hash ? hash : this.getQuestionHash(title);
            const aiGeneratedValue = aiGenerated || false;
            return [hashValue, title, aiGeneratedValue];
        })
        const [rs] = await conn.query<ResultSetHeader>(`
            INSERT INTO explorer_recommend_questions(hash, title, ai_generated)
            VALUES ?
        `, [questionValues]);
        if (rs.affectedRows !== questions.length) {
            throw new APIError(500, 'Failed to save the recommend questions.');
        }
    }

}
