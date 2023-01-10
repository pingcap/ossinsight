import fp from "fastify-plugin";
import {Job, Queue} from "bullmq";
import {
    APIError,
    BotResponseParseError,
    ExplorerCreateQuestionError,
    ExplorerPrepareQuestionError,
    SQLUnsupportedFunctionError,
    SQLUnsupportedMultipleStatementsError,
    SQLUnsupportedStatementTypeError,
    ValidateSQLError
} from "../../../utils/error";
import {Connection, ResultSetHeader} from "mysql2/promise";
import crypto from "node:crypto";
import {DateTime} from "luxon";
import {AST, Parser, Select} from "node-sql-parser";
import {BotService} from "../bot-service";
import {
    PlanStep,
    Question,
    QuestionFeedback,
    QuestionFeedbackType,
    QuestionQueryResult,
    QuestionQueryResultWithChart,
    QuestionQueueNames,
    QuestionSQLResult,
    QuestionStatus,
    ValidateSQLResult
} from "./types";
import {TiDBPlaygroundQueryExecutor} from "../../../core/executor/query-executor/TiDBPlaygroundQueryExecutor";
import {GenerateChartPromptTemplate} from "../bot-service/template/GenerateChartPromptTemplate";
import {randomUUID} from "crypto";
import {
    BarChart,
    ChartNames,
    LineChart,
    MapChart,
    NumberCard,
    PersonalCard,
    PieChart,
    RecommendedChart,
    RecommendQuestion,
    RepoCard, AnswerSummary,
    Table
} from "../bot-service/types";
import {GenerateAnswerPromptTemplate} from "../bot-service/template/GenerateAnswerPromptTemplate";
import {FastifyBaseLogger} from "fastify";
import {MySQLPromisePool} from "@fastify/mysql";
import {GenerateSummaryPromptTemplate} from "../bot-service/template/GenerateSummaryPromptTemplate";

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
      app.mysql,
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
    private readonly generteAnswerSummaryTemplate: GenerateSummaryPromptTemplate;
    private maxSelectLimit = 200;
    private options: ExplorerOption;

    constructor(
      private readonly logger: FastifyBaseLogger,
      private readonly mysql: MySQLPromisePool,
      private readonly botService: BotService,
      private readonly playgroundQueryExecutor: TiDBPlaygroundQueryExecutor,
      private readonly lowConcurrentQueue: Queue,
      private readonly highConcurrentQueue: Queue,
      options?: ExplorerOption
    ) {
        this.sqlParser = new Parser();
        this.generateChartTemplate = new GenerateChartPromptTemplate();
        this.generateAnswerTemplate = new GenerateAnswerPromptTemplate();
        this.generteAnswerSummaryTemplate = new GenerateSummaryPromptTemplate();
        this.options = Object.assign({}, {
            userMaxQuestionsPerHour: 20,
            userMaxQuestionsOnGoing: 3,
            trustedUsers: [],
            trustedUsersMaxQuestionsPerHour: 100,
            generateSQLCacheTTL: 60 * 60 * 24 * 7,
            querySQLCacheTTL: 60 * 60 * 24,
        }, options || {});
    }

    async newQuestion(conn: Connection, userId: number, githubLogin: string | undefined, q: string): Promise<Question> {
        // Init logger.
        const questionId = randomUUID();
        const logger = this.logger.child({ questionId: questionId });
        const normalizedQuestion = this.normalizeQuestion(q);
        if (normalizedQuestion.length > 255) {
            throw new APIError(400, 'The question too long, please shorten it.');
        }

        // Prepare the new question.
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
            preceding: 0
        }

        try {
            await conn.beginTransaction();

            // Check if the question is cached.
            const cachedQuestion = await this.getQuestionByHash(questionHash, this.options.generateSQLCacheTTL, conn);
            if (cachedQuestion) {
                logger.info("Question is cached, returning cached question (hash: %s).", questionHash);

                await conn.commit();
                return {
                    ...cachedQuestion,
                    hitCache: true
                };
            }

            // Give the trusted users more daily requests.
            let limit = this.options.userMaxQuestionsPerHour;
            if (this.options.trustedUsers.includes(githubLogin || '')) {
                limit = this.options.trustedUsersMaxQuestionsPerHour;
            }

            // Notice: Using FOR UPDATE, pessimistic locking controls a single user to request question serially.
            const previousQuestions = await this.getUserPastHourQuestionsWithLock(userId, conn);
            if (previousQuestions.length >= limit) {
                const oldestQuestion = previousQuestions.reduce((prev, current) => (prev.createdAt < current.createdAt) ? prev : current);
                const now = DateTime.utc();
                const waitMinutes = oldestQuestion.createdAt.diff(now.minus({ hour: 1 }), ["minutes", "seconds"]).toHuman();
                throw new APIError(429, `Too many questions request in the past hour, please wait ${waitMinutes}.`);
            }

            const onGongStatuses = [QuestionStatus.AnswerGenerating, QuestionStatus.SQLValidating, QuestionStatus.Waiting, QuestionStatus.Running];
            const onGongQuestions = previousQuestions.filter(q => onGongStatuses.includes(q.status));
            if (onGongQuestions.length >= this.options.userMaxQuestionsOnGoing) {
                logger.info("There are %d previous question on going, cancel them.", onGongQuestions.length);
                await this.cancelQuestions(conn, onGongQuestions.map(q => q.id));
            }

            question.preceding = await this.countPrecedingQuestions(question.id, conn);

            await this.createQuestion(question, conn);
            await conn.commit();
        } catch (err: any) {
            await conn.rollback();
            logger.error(err, `Failed to create a new question: ${err.message}`);
            if (err instanceof APIError) {
                throw new ExplorerCreateQuestionError(err.statusCode, err.message, question, err);
            } else {
                throw new ExplorerCreateQuestionError(500, 'Failed to create the question', question);
            }
        }

        return question;
    }

    async prepareQuestion(question: Question) {
        const { id: questionId, title } = question;
        const logger = this.logger.child({ questionId: questionId });

        try {
            question.status = QuestionStatus.AnswerGenerating;
            await this.updateQuestion(question);

            // Prepare the recommended questions.
            const popularQuestions = await this.getRecommendQuestions(3, false);
            question.recommendedQuestions?.push(...popularQuestions.map(q => q.title));

            // Generate the SQL by OpenAI.
            let answer = null;
            try {
                answer = await this.botService.questionToAnswer(this.generateAnswerTemplate, title);
            } catch (e: any) {
                if (e instanceof BotResponseParseError) {
                    const message = 'Failed to generate SQL, please try again later: ' + e.message;
                    throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorAnswerParse, {
                        message: e.message,
                        response: e.responseText,
                    }, e);
                } else {
                    const message = 'Failed to generate SQL, please try again later.';
                    throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorAnswerGenerate, {
                        message: e.message
                    }, e);
                }
            }

            // Check if there are an answer been returned.
            if (!answer) {
                const message = 'Failed to generate SQL, please try again later.';
                throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorAnswerGenerate, {
                    message: 'No answer provided.'
                });
            }

            let { sql: querySQL, chart, questions: aiGeneratedQuestions } = answer;
            question.querySQL = querySQL;
            question.chart = chart;
            question.recommendedQuestions?.unshift(...aiGeneratedQuestions);

            // Validate the generated SQL.
            question.status = QuestionStatus.SQLValidating;
            await this.updateQuestion(question);
            let statementType;
            try {
                logger.info("Validating the generated SQL: %s", querySQL);
                const res = this.validateSQL(querySQL!);
                querySQL = res.sql;
                statementType = res.statementType;
            } catch (err: any) {
                if (err instanceof ValidateSQLError) {
                    const message = 'Failed to validate the generated SQL: ' + err.message;
                    throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorValidateSQL, {
                        message: err.message
                    });
                } else {
                    const message = 'Failed to validate the generated SQL.';
                    throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorValidateSQL, {
                        message: err.message
                    });
                }
            }
            question.querySQL = querySQL;
            question.queryHash = this.getQueryHash(querySQL);

            // Try to get SQL result from cache.
            const cachedResult = await this.getCachedSQLResult(question.queryHash, this.options.querySQLCacheTTL);
            if (cachedResult) {
                logger.info("SQL result is cached, returning cached result (hash: %s).", question.queryHash);
                await this.saveQuestionResult(questionId, cachedResult);
                question = {
                    ...question,
                    ...cachedResult,
                    status: QuestionStatus.Success,
                    hitCache: true,
                }
                await this.updateQuestion(question);
                return question;
            }

            // Get the storage engines that will be used in the SQL execution.
            let engines: string[] = [];
            if (statementType === 'select') {
                try {
                    logger.info("Getting the storage engines for the SQL: %s", querySQL);
                    const plan = await this.getSQLExecutionPlan(querySQL);
                    engines = this.getStorageEnginesFromPlan(plan);
                } catch (err: any) {
                    if (err.sqlMessage) {
                        const message = `Failed to create the execution plan for the generated SQL: ${err.sqlMessage}`;
                        throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorValidateSQL, {
                            sqlMessage: err.sqlMessage,
                            message: err.message,
                            sql: querySQL
                        });
                    } else {
                        const message = `Failed to create the execution plan for the generated SQL.`;
                        throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorValidateSQL, {
                            message: err.message,
                            sql: querySQL
                        });
                    }
                }
            }

            const queueName = engines.includes('tiflash') ? QuestionQueueNames.Low : QuestionQueueNames.High;
            const queueJobId = randomUUID();
            question.engines = engines;
            question.queueName = queueName;
            question.queueJobId = queueJobId;
            question.requestedAt = DateTime.utc();
            question.status = QuestionStatus.Waiting;
            await this.updateQuestion(question);

            // Push the question to the queue.
            if (queueName === QuestionQueueNames.Low && queueJobId) {
                logger.info("Pushing the question to the low concurrent queue (jobId: %s).", queueJobId);
                await this.lowConcurrentQueue.add(QuestionQueueNames.Low, question, {
                    jobId: queueJobId
                });
            } else if (queueName === QuestionQueueNames.High && queueJobId) {
                logger.info("Pushing the question to the high concurrent queue (jobId: %s).", queueJobId);
                await this.highConcurrentQueue.add(QuestionQueueNames.High, question, {
                    jobId: queueJobId
                });
            } else {
                logger.warn("No queue name or job id provided, the question will not be executed.");
            }
        } catch (err: any) {
            if (err instanceof ExplorerPrepareQuestionError) {
                await this.updateQuestion({
                    ...question,
                    status: QuestionStatus.Error,
                    error: err.message,
                });
                await this.addSystemQuestionFeedback(questionId, err.feedbackType, JSON.stringify(err.feedbackPayload));
            } else {
                await this.updateQuestion({
                    ...question,
                    status: QuestionStatus.Error,
                    error: err.message,
                });
                await this.addSystemQuestionFeedback(questionId, QuestionFeedbackType.ErrorUnknown, JSON.stringify({
                    message: err.message
                }));
            }
            throw err;
        }
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
            throw new SQLUnsupportedFunctionError( 'didn\'t support SQL contains `rand()` function');
        }

        if (/sleep\(.*\)/ig.test(sql)) {
            throw new SQLUnsupportedFunctionError( 'didn\'t support SQL contains `sleep()` function');
        }

        try {
            const ast = this.sqlParser.astify(sql);
            let rootNode;
            if (Array.isArray(ast)) {
                if (ast.length > 1) {
                    throw new SQLUnsupportedMultipleStatementsError('didn\'t support multiple statements');
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
                    throw new SQLUnsupportedStatementTypeError('only supports SELECT, SHOW and DESC statements');
            }
        } catch (err: any) {
            if (err instanceof ValidateSQLError) {
                throw err;
            }

            throw new ValidateSQLError(err.message, sql);
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

    async getSQLExecutionPlan(sql: string, conn?: Connection) {
        const connection = conn || this.mysql;
        const [rows] = await connection.query<any[]>('explain format = "brief" ' + sql);
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

    // CRUD.

    private async createQuestion(question: Question, conn?: Connection) {
        const connection = conn || this.mysql;
        const {
            id, hash, userId, status, title, querySQL, queryHash, engines = [],
            recommended, createdAt, queueName, queueJobId = null, chart, recommendedQuestions = [], error = null
        } = question;
        const enginesValue = JSON.stringify(engines);
        const chartValue = chart !== undefined ? JSON.stringify(chart) : null;
        const recommendedQuestionsValue = JSON.stringify(recommendedQuestions);
        const [rs] = await connection.query<ResultSetHeader>(`
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

    private async updateQuestionStatus(questionId: string, status: QuestionStatus) {
        const [rs] = await this.mysql.query<ResultSetHeader>(`
            UPDATE explorer_questions SET status = ? WHERE id = UUID_TO_BIN(?)
        `, [status, questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question status.');
        }
    }

    private async markQuestionRunning(questionId: string, executedAt?: DateTime) {
        const [rs] = await this.mysql.query<ResultSetHeader>(`
            UPDATE explorer_questions SET status = ?, executed_at = ? WHERE id = UUID_TO_BIN(?)
        `, [QuestionStatus.Running, executedAt?.toSQL() || null, questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question status.');
        }
    }

    private async updateQuestion(question: Question) {
        const {
            id, status, recommended, querySQL, queryHash, engines = [], result = null, chart = null, recommendedQuestions = [],
            queueName = null, queueJobId = null, requestedAt, executedAt, finishedAt, spent, error = null
        } = question;

        const enginesValue = JSON.stringify(engines);
        const resultValue = result !== undefined ? JSON.stringify(result) : null;
        const chartValue = chart !== undefined ? JSON.stringify(chart) : null;
        const recommendedQuestionsValue = JSON.stringify(recommendedQuestions);
        const requestedAtValue = requestedAt ? requestedAt.toSQL() : null;
        const executedAtValue = executedAt ? executedAt.toSQL() : null;
        const finishedAtValue = finishedAt ? finishedAt.toSQL() : null;

        const [rs] = await this.mysql.query<ResultSetHeader>(`
            UPDATE explorer_questions
            SET 
                status = ?, recommended = ?, query_sql = ?, query_hash = ?, engines = ?, result = ?, chart = ?, recommended_questions = ?, 
                queue_name = ?, queue_job_id = ?, requested_at = ?, executed_at = ?, finished_at = ?, spent = ?, error = ?
            WHERE id = UUID_TO_BIN(?)
        `, [
            status, recommended, querySQL, queryHash, enginesValue, resultValue, chartValue, recommendedQuestionsValue,
            queueName, queueJobId, requestedAtValue, executedAtValue, finishedAtValue, spent, error, id
        ]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question.');
        }
    }

    private async saveQuestionResult(questionId: string, questionResult: QuestionQueryResult, hitCache = false, conn?: Connection) {
        const connection = conn || this.mysql;
        const { result, executedAt, finishedAt, spent } = questionResult;
        const [rs] = await connection.query<ResultSetHeader>(`
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

    private async saveQuestionError(questionId: string, message: string = 'unknown', conn?: Connection) {
        const connection = conn || this.mysql;
        const [rs] = await connection.query<ResultSetHeader>(`
            UPDATE explorer_questions SET status = ?, error = ? WHERE id = UUID_TO_BIN(?)
        `, [QuestionStatus.Error, message, questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question error.');
        }
    }

    private async saveAnswerSummary(questionId: string, summary: AnswerSummary, conn?: Connection) {
        const connection = conn || this.mysql;
        const summaryValue = JSON.stringify(summary);
        const [rs] = await connection.query<ResultSetHeader>(`
            UPDATE explorer_questions
            SET answer_summary = ?
            WHERE id = UUID_TO_BIN(?)
        `, [summaryValue, questionId]);
        if (rs.affectedRows === 0) {
            throw new APIError(500, 'Failed to save the answer summary.');
        }
    }

    async getQuestionById(questionId: string, conn?: Connection): Promise<Question | null> {
        const connection = conn || this.mysql;
        const [rows] = await connection.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, query_sql AS querySQL, query_hash AS queryHash, engines, 
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions, result, chart, answer_summary AS answerSummary, recommended,
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

    async getQuestionByHash(questionHash: string, ttl: number, conn?: Connection): Promise<Question | null> {
        const connection = conn || this.mysql;;
        const [rows] = await connection.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, query_sql AS querySQL, query_hash AS queryHash, engines,
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions, result, chart, answer_summary AS answerSummary, recommended, 
                hit_cache AS hitCache, created_at AS createdAt, requested_at AS requestedAt,
                executed_at AS executedAt, finished_at AS finishedAt, spent, error
            FROM explorer_questions
            WHERE
                hash = ?
                AND status IN (?)
                AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
            ORDER BY created_at DESC
            LIMIT 1
        `, [questionHash, QuestionStatus.Success, ttl]);
        if (rows.length !== 1) {
            return null;
        }
        return this.mapRecordToQuestion(rows[0]);
    }

    async getLatestQuestionByQueryHash(queryHash: string, ttl: number): Promise<Question | null> {
        const [rows] = await this.mysql.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, query_sql AS querySQL, query_hash AS queryHash, engines,
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions, result, chart, answer_summary AS answerSummary, recommended, 
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

    async getCachedSQLResult(queryHash: string, ttl: number): Promise<QuestionQueryResultWithChart | null> {
        const question = await this.getLatestQuestionByQueryHash(queryHash, ttl);
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

    async getUserPastHourQuestionsWithLock(userId: number, conn?: Connection): Promise<Question[]> {
        const connection = conn || this.mysql;
        const [rows] = await connection.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, query_sql AS querySQL, query_hash AS queryHash, engines,
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions, result, answer_summary AS answerSummary, chart, recommended, 
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

    async countPrecedingQuestions(questionId: string, conn?: Connection): Promise<number> {
        const connection = conn || this.mysql;
        const [rows] = await connection.query<any[]>(`
            SELECT COUNT(*) AS count
            FROM explorer_questions eq
            WHERE
                status IN (?)
                AND created_at < (SELECT created_at FROM explorer_questions WHERE id = UUID_TO_BIN(?))
                AND queue_name = (SELECT queue_name FROM explorer_questions WHERE id = UUID_TO_BIN(?))
        `, [[QuestionStatus.Running, QuestionStatus.Waiting], questionId, questionId]);
        return rows[0].count;
    }

    // Resolve questions.

    async resolveQuestion(job: Job, question: Question): Promise<QuestionQueryResult> {
        const { id: questionId, querySQL } = question;
        try {
            const questionResult = await this.executeQuery(questionId, querySQL!);

            // Check chart if match the result.
            if (!this.checkChart(question.chart, questionResult.result)) {
                await this.addSystemQuestionFeedback(questionId, QuestionFeedbackType.ErrorValidateChart, JSON.stringify(question.chart));
            }

            // Answer summary.
            if (Array.isArray(questionResult.result.rows) && questionResult.result.rows.length > 0) {
                try {
                    await this.updateQuestionStatus(questionId, QuestionStatus.Summarizing);
                    await this.generateAnswerSummary(questionId, question.title, questionResult.result);
                } catch (err: any) {
                    this.logger.warn(`Failed to generate answer summary for question ${questionId}: ${err.message}`);
                }
            }

            await this.saveQuestionResult(questionId, {
                ...questionResult,
            }, false);

            return questionResult;
        } catch (err: any) {
            await this.saveQuestionError(questionId, err);
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
            await this.markQuestionRunning(questionId, executedAt);
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

    private checkChart(chart: RecommendedChart | undefined, result: QuestionSQLResult): boolean {
        if (chart === null || chart === undefined) {
            return false;
        }

        const columnNames = result.fields.map((f) => f.name);

        switch (chart.chartName) {
            case ChartNames.TABLE:
                const table: Table = chart as any;
                if (Array.isArray(table.columns) && table.columns.length > 0) {
                    return table.columns.every((column) => this.isValidColumn(column, columnNames));
                } else {
                    return false;
                }
            case ChartNames.NUMBER_CARD:
                const numberCard: NumberCard = chart as any;
                return this.isValidColumn(numberCard.label, columnNames) && this.isValidColumn(numberCard.value, columnNames);
            case ChartNames.BAR_CHART:
                const barChart: BarChart = chart as any;

                if (!this.isValidColumn(barChart.x, columnNames)) {
                    return false;
                }

                if (Array.isArray(barChart.y) && barChart.y.length > 0) {
                    return barChart.y.every((column) => this.isValidColumn(column, columnNames));
                } else if (typeof barChart.y === 'string') {
                    return this.isValidColumn(barChart.y, columnNames);
                } else {
                    return false;
                }
            case ChartNames.LINE_CHART:
                const lineChart: LineChart = chart as any;

                if (!this.isValidColumn(lineChart.x, columnNames)) {
                    return false;
                }

                if (Array.isArray(lineChart.y) && lineChart.y.length > 0) {
                    return lineChart.y.every((column) => this.isValidColumn(column, columnNames));
                } else if (typeof lineChart.y === 'string') {
                    return this.isValidColumn(lineChart.y, columnNames);
                } else {
                    return false;
                }
            case ChartNames.PIE_CHART:
                const pieChart: PieChart = chart as any;
                return this.isValidColumn(pieChart.label, columnNames) && this.isValidColumn(pieChart.value, columnNames);
            case ChartNames.MAP_CHART:
                const mapChart: MapChart = chart as any;
                return this.isValidColumn(mapChart.country_code, columnNames) && this.isValidColumn(mapChart.value, columnNames);
            case ChartNames.PERSONAL_CARD:
                const personalCard: PersonalCard = chart as any;
                return this.isValidColumn(personalCard.user_login, columnNames);
            case ChartNames.REPO_CARD:
                const repoCard: RepoCard = chart as any;
                return this.isValidColumn(repoCard.repo_name, columnNames);
            default:
                return false;
        }
    }

    private isValidColumn(column: any, columns: string[]): boolean {
        return typeof column === 'string' && columns.includes(column);
    }

    // Error handling.

    async wrapperTheErrorMessage(question: Question) {
        if (typeof question.error !== 'string') {
            return;
        }

        if (question.error.includes('denied for user')) {
            question.error = 'Failed to execute SQL: commend access denied';
        } else if (question.error.includes('connect ECONNREFUSED')) {
            question.error = 'Failed to connect database, please try again later.';
        } else if (question.error.includes('rpc error: code = Unavailable')) {
            question.error = 'Failed to execute SQL, some of TiFlash nodes are unavailable, please try again later.';
        }
    }

    // Chart.

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

        await this.saveQuestionChart(questionId, chart, conn);
        return chart;
    }

    async generateChartByQuestionId(conn: Connection, questionId: string) {
        const question = await this.getQuestionById(questionId, conn);
        if (!question) {
            throw new APIError(404, 'Question not found.');
        }
        if (question.status !== QuestionStatus.Success || !question.result) {
            throw new APIError(409, 'The SQL query to resolve the question has not been finished.');
        }

        const { id, title, result } = question;
        return this.generateChart(conn, id, title, result);
    }

    private async saveQuestionChart(questionId: string, chart: RecommendedChart, conn?: Connection) {
        const connection = conn || this.mysql;
        const [rs] = await connection.query<ResultSetHeader>(`
            UPDATE explorer_questions SET chart = ? WHERE id = UUID_TO_BIN(?)
        `, [JSON.stringify(chart), questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question chart.');
        }
    }

    // Recommend questions.

    async getRecommendQuestions(n: number, aiGenerated?: boolean, conn?: Connection): Promise<RecommendQuestion[]> {
        const connection = conn || this.mysql;
        let questions = [];
        try {
            if (aiGenerated !== undefined) {
                [questions] = await connection.query<any[]>(`
                SELECT hash, title, ai_generated
                FROM explorer_recommend_questions
                WHERE ai_generated = ?
                ORDER BY RAND()
                LIMIT ?
            `, [aiGenerated, n]);
            } else {
                [questions] = await connection.query<any[]>(`
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
        if (questionValues.length === 0) {
            return;
        }
        const [rs] = await conn.query<ResultSetHeader>(`
            INSERT INTO explorer_recommend_questions(hash, title, ai_generated)
            VALUES ?
            ON DUPLICATE KEY UPDATE title = VALUES(title), ai_generated = VALUES(ai_generated)
        `, [questionValues]);
        if (rs.affectedRows === 0) {
            throw new APIError(500, 'Failed to save the recommend questions.');
        }
    }

    // Question feedback.

    async addSystemQuestionFeedback(questionId: string, feedbackType: QuestionFeedbackType, feedbackContent?: string, conn?: Connection) {
        await this.addQuestionFeedback({
            userId: 0,
            questionId,
            satisfied: false,
            feedbackType,
            feedbackContent,
        }, conn);
    }

    async removeUserQuestionFeedbacks(userId: number, questionId: string, conn?: Connection) {
        const connection = conn || this.mysql;
        await connection.query<ResultSetHeader>(`
            DELETE FROM explorer_question_feedbacks
            WHERE user_id = ? AND question_id = UUID_TO_BIN(?)
        `, [userId, questionId]);
    }

    async getUserQuestionFeedbacks(userId: number, questionId: string, conn?: Connection): Promise<QuestionFeedback[]> {
        const connection = conn || this.mysql;
        const [rows] = await connection.query<any[]>(`
            SELECT
                id, user_id AS userId, BIN_TO_UUID(question_id) AS questionId, satisfied, feedback_type AS feedbackType,
                feedback_content AS feedbackContent, created_at AS createdAt
            FROM explorer_question_feedbacks
            WHERE user_id = ? AND question_id = UUID_TO_BIN(?)
        `, [userId, questionId]);
        return rows;
    }

    async addQuestionFeedback(feedback: Omit<QuestionFeedback, "id" | "createdAt">, conn?: Connection) {
        const connection = conn || this.mysql;
        const { userId = 0, questionId, satisfied = false, feedbackType, feedbackContent = null } = feedback;
        const [rs] = await connection.query<ResultSetHeader>(`
            INSERT INTO explorer_question_feedbacks(user_id, question_id, satisfied, feedback_type, feedback_content)
            VALUES (?, UUID_TO_BIN(?), ?, ?, ?)
        `, [userId, questionId, satisfied, feedbackType, feedbackContent]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to add the question feedback.');
        }
    }

    // Question answer summary.

    async generateAnswerSummaryByQuestionId(questionId: string): Promise<AnswerSummary> {
        const question = await this.getQuestionById(questionId);
        if (!question) {
            throw new APIError(404, 'Question not found.');
        }
        const { title, result } = question;
        if (!result || !Array.isArray(result.rows) || result.rows.length === 0) {
            throw new APIError(429, 'The question has no result.');
        }

        return this.generateAnswerSummary(questionId, title, result);
    }

    async generateAnswerSummary(questionId: string, title: string, result: QuestionSQLResult): Promise<AnswerSummary> {
        const summary = await this.botService.summaryAnswer(this.generteAnswerSummaryTemplate, title, result.rows);
        if (!summary) {
            throw new APIError(500, 'Failed to generate the answer summary.');
        }

        // Notice: Sometime AI will generate the summary content ends with hashtags, remove them.
        if (Array.isArray(summary.hashtags) && summary.hashtags.length > 0) {
            const hashtagsText = summary.hashtags.map((ht) => `#${ht}`).join(' ');
            summary.content = summary.content?.replace(hashtagsText, '');
        }

        await this.saveAnswerSummary(questionId, summary);
        return summary;
    }

}
