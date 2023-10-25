import fp from "fastify-plugin";
import {Job, Queue} from "bullmq";
import {withConnection, withTransaction} from "../../../utils/db";
import {
    APIError, BotResponseGenerateError,
    BotResponseParseError,
    ExplorerCreateQuestionError,
    ExplorerPrepareQuestionError, ExplorerRecommendQuestionError,
    ExplorerResolveQuestionError, ExplorerSetQuestionTagsError,
    ExplorerTooManyRequestError, ExplorerCancelRecommendQuestionError,
    SQLUnsupportedFunctionError,
    ValidateSQLError
} from "../../../utils/error";
import {Connection, ResultSetHeader} from "mysql2/promise";
import crypto from "node:crypto";
import {DateTime} from "luxon";
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
import {randomUUID} from "crypto";
import {
    BarChart,
    ChartNames,
    LineChart,
    MapChart,
    NumberCard,
    PersonalCard,
    PieChart,
    QuestionTag,
    RecommendedChart,
    RecommendQuestion,
    RepoCard,
    Table
} from "../bot-service/types";
import {FastifyBaseLogger} from "fastify";
import {MySQLPromisePool} from "@fastify/mysql";
import async from "async";
import sleep from "../../../utils/sleep";
import {pino} from "pino";
import BaseLogger = pino.BaseLogger;

declare module 'fastify' {
    interface FastifyInstance {
        explorerService: ExplorerService;
    }
}

export const SYSTEM_USER_ID = 0;

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
          trustedUsersMaxQuestionsPerHour: 200,
          generateSQLCacheTTL: app.config.EXPLORER_GENERATE_SQL_CACHE_TTL,
          querySQLCacheTTL: app.config.EXPLORER_QUERY_SQL_CACHE_TTL,
          outputAnswerInStream: app.config.EXPLORER_OUTPUT_ANSWER_IN_STREAM
      }
    ));
}, {
    name: '@ossinsight/explorer-service',
    dependencies: [
        '@fastify/env',
        '@ossinsight/redis',
        '@ossinsight/bot-service',
        '@ossinsight/explorer-high-concurrent-queue',
        '@ossinsight/explorer-low-concurrent-queue'
    ]
});

export interface ExplorerOption {
    userMaxQuestionsPerHour: number;
    userMaxQuestionsOnGoing: number;
    trustedUsersMaxQuestionsPerHour: number;
    generateSQLCacheTTL: number;
    querySQLCacheTTL: number;
    querySQLTimeout: number;
    outputAnswerInStream: boolean;
}

export class ExplorerService {
    private options: ExplorerOption;

    constructor(
      private readonly logger: FastifyBaseLogger,
      private readonly tidb: MySQLPromisePool,
      private readonly botService: BotService,
      private readonly playgroundQueryExecutor: TiDBPlaygroundQueryExecutor,
      private readonly lowConcurrentQueue: Queue,
      private readonly highConcurrentQueue: Queue,
      options?: Partial<ExplorerOption>
    ) {
        this.options = Object.assign({}, {
            userMaxQuestionsPerHour: 20,
            userMaxQuestionsOnGoing: 3,
            trustedUsersMaxQuestionsPerHour: 200,
            generateSQLCacheTTL: 60 * 60 * 24 * 7,
            querySQLCacheTTL: 60 * 60 * 24,
            querySQLTimeout: 30 * 1000,
            outputAnswerInStream: false
        }, options || {});
    }

    async newQuestion(
      userId: number, q: string, ignoreCache: boolean = false, ignoreRateLimit: boolean = false,
      needReview: boolean = false, batchJobId: string | null = null
    ): Promise<Question> {
        const questionId = randomUUID();
        const logger = this.logger.child({ questionId: questionId });
        const normalizedQuestion = this.normalizeQuestion(q);
        if (normalizedQuestion.length > 512) {
            const message = `The question is too long, please shorten it.`;
            throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorQuestionIsTooLong, {
                message: message
            });
        }

        // Prepare the new question.
        logger.info("Creating a new question: %s", normalizedQuestion);
        const questionHash = this.getQuestionHash(normalizedQuestion);

        // Check if the question is cached.
        if (!ignoreCache) {
          const cachedQuestion = await this.getLatestQuestionByHash(questionHash, this.options.generateSQLCacheTTL);
          if (cachedQuestion) {
            logger.info("Question is cached, returning cached question (hash: %s).", questionHash);

            return {
              ...cachedQuestion,
              hitCache: true
            };
          }
        }

        // Give the trusted users more daily requests.
        let limit = this.options.userMaxQuestionsPerHour;
        if (await this.checkIfTrustedUser(userId)) {
          limit = this.options.trustedUsersMaxQuestionsPerHour;
        }

        // Create the new question.
        const question: Question = {
          id: questionId,
          hash: questionHash,
          userId: userId,
          status: QuestionStatus.New,
          title: q,
          recommendedQuestions: [],
          batchJobId: batchJobId,
          needReview: needReview,
          recommended: false,
          createdAt: DateTime.utc(),
          hitCache: false,
          preceding: 0
        }
        await withTransaction(this.tidb, async (conn: Connection) => {
          if (!ignoreRateLimit) {
            // Notice: Using FOR UPDATE, pessimistic locking controls a single user to request question serially.
            const previousQuestions = await this.getUserPastHourQuestionsWithLock(conn, userId);
            if (previousQuestions.length >= limit) {
              const oldestQuestion = previousQuestions.reduce((prev, current) => (prev.createdAt < current.createdAt) ? prev : current);
              const now = DateTime.utc();
              const waitMinutes = oldestQuestion.createdAt.diff(now.minus({ hour: 1 }), ["minutes", "seconds"]);
              const waitMinutesText = waitMinutes.toHuman();
              throw new ExplorerTooManyRequestError(`Too many questions request in the past hour, please wait ${waitMinutesText}.`, waitMinutes.minutes);
            }

            const onGongStatuses = [QuestionStatus.AnswerGenerating, QuestionStatus.SQLValidating, QuestionStatus.Waiting, QuestionStatus.Running];
            const onGongQuestions = previousQuestions.filter(q => onGongStatuses.includes(q.status));
            if (onGongQuestions.length >= this.options.userMaxQuestionsOnGoing) {
              logger.info("There are %d previous question on going, cancel them.", onGongQuestions.length);
              await this.cancelQuestions(conn, onGongQuestions.map(q => q.id));
            }
          }

          question.preceding = await this.countPrecedingQuestions(question.id);
          await this.createQuestion(conn, question);
        }, {
          onError: (conn, err) => {
            logger.error(err, `Failed to create a new question: ${err.message}`);
            if (err instanceof ExplorerTooManyRequestError) {
              throw err;
            } else if (err instanceof APIError) {
              throw new ExplorerCreateQuestionError(err.statusCode, err.message, question, err);
            } else {
              throw new ExplorerCreateQuestionError(500, 'Failed to create the question', question);
            }
          }
        });

        return question;
    }

    async prepareQuestion(question: Question) {
        const { id: questionId } = question;
        const logger = this.logger.child({ questionId: questionId });

        try {
            // Update question status.
            question.status = QuestionStatus.AnswerGenerating;
            await this.updateQuestion(question);

            // Generate the SQL by OpenAI.
            let outputInStream = this.options.outputAnswerInStream;
            await this.generateAnswer(logger, question, outputInStream);
            if (!question.sqlCanAnswer || typeof question.querySQL !== 'string' || question.querySQL.length === 0) {
                const message = 'Failed to generate SQL, the question may exceed the scope of what can be answered.';
                throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorSQLCanNotAnswer, {
                    message: message
                });
            }

            // Update question status.
            question.status = QuestionStatus.SQLValidating;
            question.queryHash = this.getQueryHash(question.querySQL);
            await this.updateQuestion(question);

            // Validate the generated SQL.
            let statementType;
            try {
                logger.info({ querySQL: question.querySQL }, "Validating the generated SQL.");
                const res = this.validateSQL(question.querySQL!);
                statementType = res.statementType;
            } catch (err: any) {
                if (err instanceof ValidateSQLError) {
                    throw new ExplorerPrepareQuestionError(err.message, QuestionFeedbackType.ErrorValidateSQL, {
                        message: err.message
                    });
                } else {
                    const message = 'Failed to validate the generated SQL.';
                    throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorValidateSQL, {
                        message: err.message
                    });
                }
            }

            // Try to get SQL result from cache.
            const cachedResult = await this.getCachedSQLResult(question.queryHash, this.options.querySQLCacheTTL);
            if (cachedResult) {
                logger.info({ queryHash: question.queryHash }, "SQL result is cached, returning cached result.", question.queryHash);
                await this.saveQuestionResult(questionId, QuestionStatus.Success, cachedResult);
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
            question.engines = [];
            if (statementType === 'select') {
                [question.engines, question.plan] = await this.getSQLExecutionPlanAndEngines(logger, question.querySQL);
            }
            question.queueName = question.engines?.includes('tiflash') ? QuestionQueueNames.Low : QuestionQueueNames.High;
            question.queueJobId = randomUUID();
            question.requestedAt = DateTime.utc();
            question.status = QuestionStatus.Waiting;
            await this.updateQuestion(question);

            // Push the question to the queue.
            await this.pushJobToQueue(logger, question);
        } catch (err: any) {
            if (err instanceof ExplorerPrepareQuestionError) {
                await this.updateQuestion({
                    ...question,
                    errorType: err.feedbackType,
                    status: QuestionStatus.Error,
                    error: this.wrapperTheErrorMessage(err.message),
                });
                await this.addSystemQuestionFeedback(questionId, err.feedbackType, JSON.stringify(err.feedbackPayload));
            } else {
                await this.updateQuestion({
                    ...question,
                    errorType: err.ErrorUnknown,
                    status: QuestionStatus.Error,
                    error: this.wrapperTheErrorMessage(err.message),
                });
                await this.addSystemQuestionFeedback(questionId, QuestionFeedbackType.ErrorUnknown, JSON.stringify({
                    message: err.message
                }));
            }
            throw err;
        }
    }

    // TODO: refactor it, make it more readable.
    async generateAnswer(logger: BaseLogger, question: Question, outputInStream: boolean): Promise<string | null> {
        let responseText: string | null = null;
        const { id: questionId, title } = question;
        for (let i = 1; i <= 3; i++) {
            try {
                if (outputInStream) {
                    // Update the field one by one.
                    [question.answer, responseText] = await this.botService.questionToAnswerInStream(title, async (answer, key, value) => {
                        // @ts-ignore
                        question[key] = value;
                        question.answer = answer;
                        try {
                            await this.updateQuestion(question);
                            logger.info({ key: key, value: value }, `Updated answer field.`)
                        } catch (e) {
                            logger.error(e, `Failed to update question with field ${key} = ${value}.`)
                        }
                    });
                } else {
                    // Update all the fields at once.
                    [question.answer, responseText] = await this.botService.questionToAnswerInNonStream(title);
                    question.revisedTitle = question.answer?.revisedTitle;
                    question.notClear = question.answer?.notClear;
                    question.assumption = question.answer?.assumption;
                    question.combinedTitle = question.answer?.combinedTitle;
                    question.sqlCanAnswer = question.answer?.sqlCanAnswer;
                    question.querySQL = question.answer?.querySQL;
                    question.chart = question.answer?.chart;
                    await this.updateQuestion(question);
                    logger.info(`Updating question with all field.`)
                }

                // Check if there are an answer been returned.
                if (!question.answer || Object.keys(question.answer).length === 0) {
                    const message = 'Generated an empty answer.';
                    throw new BotResponseGenerateError(message, responseText);
                }

                return responseText;
            } catch (e: any) {
                // Reset the question and answer, and try again.
                if (i < 3) {
                    logger.warn(e, `Failed to generate answer for question ${questionId}, retrying (${i + 1}/3)...`);

                    question.revisedTitle = undefined;
                    question.notClear = undefined;
                    question.assumption = undefined;
                    question.combinedTitle = undefined;
                    question.sqlCanAnswer = undefined;
                    question.querySQL = undefined;
                    question.chart = undefined;

                    // Wait for a while before retrying.
                    await sleep(1000 * i);

                    // Notice: Disable the output in stream mode if it failed.
                    outputInStream = false;
                    continue;
                }

                if (e instanceof BotResponseParseError) {
                    throw new ExplorerPrepareQuestionError(e.message, QuestionFeedbackType.ErrorAnswerParse, {
                        message: e.message,
                        responseText: e.responseText,
                    }, e);
                } else if (e instanceof BotResponseGenerateError) {
                    throw new ExplorerPrepareQuestionError(e.message, QuestionFeedbackType.ErrorAnswerGenerate, {
                        message: e.message,
                        responseText: e.responseText,
                    }, e);
                } else {
                    const message = 'Failed to generate answer, please try again later';
                    throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorAnswerGenerate, {
                        message: e.message
                    }, e);
                }
            }
        }
        return responseText;
    }

    async getSQLExecutionPlanAndEngines(logger: BaseLogger, querySQL: string): Promise<[string[], Record<string, string>[]]> {
        try {
            logger.info({ querySQL }, "Getting the execution plan and storage engines for the SQL.");
            const plan = await this.getSQLExecutionPlan(querySQL);
            return [this.getStorageEnginesFromPlan(plan), plan];
        } catch (err: any) {
            if (err.sqlMessage) {
                throw new ExplorerPrepareQuestionError(err.sqlMessage, QuestionFeedbackType.ErrorValidateSQL, {
                    sqlMessage: err.sqlMessage,
                    message: err.message,
                    sql: querySQL
                });
            } else {
                const message = 'Failed to validate the generated SQL.';
                throw new ExplorerPrepareQuestionError(message, QuestionFeedbackType.ErrorValidateSQL, {
                    message: err.message,
                    sql: querySQL
                });
            }
        }
    }

    async pushJobToQueue(logger: BaseLogger, question: Question) {
        if (!question.queueJobId) {
            logger.warn("No job id provided, the question will not be executed.");
            return;
        }

        const log = this.logger.child({ jobId: question.queueJobId });
        if (!question.queueName) {
            log.warn("No queue name provided, the question will not be executed.");
            return;
        }


        switch (question.queueName) {
            case QuestionQueueNames.Low:
                log.info("Pushing the question to the low concurrent queue.");
                await this.lowConcurrentQueue.add(QuestionQueueNames.Low, question, {
                    jobId: question.queueJobId
                });
                break;
            case QuestionQueueNames.High:
                log.info("Pushing the question to the high concurrent queue.");
                await this.highConcurrentQueue.add(QuestionQueueNames.High, question, {
                    jobId: question.queueJobId
                });
                break;
            default:
                log.warn("No queue name provided, the question will not be executed.");
                break;
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
            throw new SQLUnsupportedFunctionError( 'Didn\'t support SQL contains `rand()` function');
        }

        if (/sleep\(.*\)/ig.test(sql)) {
            throw new SQLUnsupportedFunctionError( 'Didn\'t support SQL contains `sleep()` function');
        }

        return {
            sql: sql,
            statementType: 'select'
        };
    }

    async getSQLExecutionPlan(sql: string) {
        const [rows] = await this.tidb.query<any[]>('explain format = "brief" ' + sql);
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

    private async createQuestion(conn: Connection, question: Question) {
        const {
            id, hash, userId, status, title, querySQL, queryHash, engines = [],
            batchJobId = null, needReview, recommended, createdAt, queueName, queueJobId = null, chart, recommendedQuestions = [], error = null
        } = question;
        const enginesValue = JSON.stringify(engines);
        const chartValue = chart !== undefined ? JSON.stringify(chart) : null;
        const recommendedQuestionsValue = JSON.stringify(recommendedQuestions);
        const [rs] = await conn.query<ResultSetHeader>(`
            INSERT INTO explorer_questions(
                id, hash, user_id, status, title, query_sql, query_hash, engines,
                batch_job_id, need_review, recommended, created_at, queue_name, queue_job_id, chart, recommended_questions, error
            ) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, hash, userId, status, title, querySQL, queryHash, enginesValue,
            batchJobId, needReview, recommended, createdAt.toSQL(), queueName, queueJobId, chartValue, recommendedQuestionsValue, error
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

    private async markQuestionRunning(questionId: string, executedAt?: DateTime) {
        const [rs] = await this.tidb.query<ResultSetHeader>(`
            UPDATE explorer_questions SET status = ?, executed_at = ? WHERE id = UUID_TO_BIN(?)
        `, [QuestionStatus.Running, executedAt?.toSQL() || null, questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question status.');
        }
    }

    async updateQuestion(question: Question) {
        const {
            id, answer = null, revisedTitle = null, notClear = null, assumption = null, combinedTitle = null, status, recommended, sqlCanAnswer = true,
            querySQL, queryHash, engines = [], plan , result = null, chart = null, recommendedQuestions = [],
            queueName = null, queueJobId = null, requestedAt, executedAt, finishedAt, spent, errorType = null, error = null
        } = question;

        const answerValue = answer !== undefined ? JSON.stringify(answer) : null;
        const planValue = result !== undefined ? JSON.stringify(plan) : null;
        const enginesValue = JSON.stringify(engines);
        const resultValue = result !== undefined ? JSON.stringify(result) : null;
        const chartValue = chart !== undefined ? JSON.stringify(chart) : null;
        const recommendedQuestionsValue = JSON.stringify(recommendedQuestions);
        const requestedAtValue = requestedAt ? requestedAt.toSQL() : null;
        const executedAtValue = executedAt ? executedAt.toSQL() : null;
        const finishedAtValue = finishedAt ? finishedAt.toSQL() : null;

        await withTransaction(this.tidb, async (conn) => {
            const [rs] = await conn.query<ResultSetHeader>(`
                UPDATE explorer_questions
                SET
                    answer = ?, revised_title = ?, not_clear = ?, assumption = ?, combined_title = ?, status = ?, recommended = ?, sql_can_answer = ?, 
                    query_sql = ?, query_hash = ?, engines = ?, plan = ?, result = ?, chart = ?, recommended_questions = ?, 
                    queue_name = ?, queue_job_id = ?, requested_at = ?, executed_at = ?, finished_at = ?, spent = ?, error_type = ?, error = ?
                WHERE id = UUID_TO_BIN(?)
            `, [
                answerValue, revisedTitle, notClear, assumption, combinedTitle, status, recommended, sqlCanAnswer,
                querySQL, queryHash, enginesValue, planValue, resultValue, chartValue, recommendedQuestionsValue,
                queueName, queueJobId, requestedAtValue, executedAtValue, finishedAtValue, spent, errorType, error, id
            ]);

            if (rs.affectedRows !== 1) {
                throw new APIError(500, 'Failed to update the question.');
            }
        });
    }

    private async saveQuestionResult(questionId: string, status: QuestionStatus, questionResult: QuestionQueryResult, hitCache = false) {
        const { result, executedAt, finishedAt, spent } = questionResult;
        const [rs] = await this.tidb.query<ResultSetHeader>(`
            UPDATE explorer_questions
            SET status = ?, result = ?, executed_at = ?, finished_at = ?, spent = ?, hit_cache = ?
            WHERE id = UUID_TO_BIN(?)
        `, [
            status,
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

    private async saveQuestionError(
      questionId: string, errorType: QuestionFeedbackType = QuestionFeedbackType.ErrorUnknown,
      message: string = 'unknown'
    ) {
        const [rs] = await this.tidb.query<ResultSetHeader>(`
            UPDATE explorer_questions SET status = ?, error_type = ?, error = ? WHERE id = UUID_TO_BIN(?)
        `, [QuestionStatus.Error, errorType, message, questionId]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to update the question error.');
        }
    }

    async getQuestionById(questionId: string): Promise<Question | null> {
        const [rows] = await this.tidb.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, answer, revised_title AS revisedTitle, not_clear AS notClear, 
                assumption, combined_title AS combinedTitle, sql_can_answer AS sqlCanAnswer, query_sql AS querySQL, query_hash AS queryHash, engines, plan,
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions, 
                result, chart, answer_summary AS answerSummary, recommended, hit_cache AS hitCache, 
                created_at AS createdAt, requested_at AS requestedAt, executed_at AS executedAt, finished_at AS finishedAt, 
                spent, error_type AS errorType, error
            FROM explorer_questions
            WHERE id = UUID_TO_BIN(?)
        `, [questionId]);
        if (rows.length !== 1) {
            return null;
        }
        return this.mapRecordToQuestion(rows[0]);
    }

    async getQuestionByIdOrError(questionId: string): Promise<Question> {
        const question = await this.getQuestionById(questionId);
        if (question === null) {
            throw new APIError(404, 'Question not found.');
        }
        return question;
    }

    async getLatestQuestionByHash(questionHash: string, ttl: number): Promise<Question | null> {
        const [rows] = await this.tidb.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, answer, revised_title AS revisedTitle, not_clear AS notClear,
                assumption, combined_title AS combinedTitle, sql_can_answer AS sqlCanAnswer, query_sql AS querySQL, query_hash AS queryHash, engines, plan,
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions,
                result, chart, answer_summary AS answerSummary, recommended, hit_cache AS hitCache,
                created_at AS createdAt, requested_at AS requestedAt, executed_at AS executedAt, finished_at AS finishedAt,
                spent, error_type AS errorType, error
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

    async getRecommendedQuestionsByHash(conn: Connection, questionHash: string): Promise<Question[]> {
        const [rows] = await conn.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, answer, revised_title AS revisedTitle, not_clear AS notClear,
                assumption, combined_title AS combinedTitle, sql_can_answer AS sqlCanAnswer, query_sql AS querySQL, query_hash AS queryHash, engines, plan,
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions,
                result, chart, answer_summary AS answerSummary, recommended, hit_cache AS hitCache,
                created_at AS createdAt, requested_at AS requestedAt, executed_at AS executedAt, finished_at AS finishedAt,
                spent, error_type AS errorType, error
            FROM explorer_questions
            WHERE hash = ? AND recommended = 1
        `, [questionHash]);
        return rows.map(this.mapRecordToQuestion);
    }

    async getLatestQuestionByQueryHash(queryHash: string, ttl: number): Promise<Question | null> {
        const [rows] = await this.tidb.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, answer, revised_title AS revisedTitle, not_clear AS notClear,
                assumption, combined_title AS combinedTitle, sql_can_answer AS sqlCanAnswer, query_sql AS querySQL, query_hash AS queryHash, engines, plan,
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions,
                result, chart, answer_summary AS answerSummary, recommended, hit_cache AS hitCache,
                created_at AS createdAt, requested_at AS requestedAt, executed_at AS executedAt, finished_at AS finishedAt,
                spent, error_type AS errorType, error
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
        if (!queryHash) {
            return null;
        }
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

    async getUserPastHourQuestionsWithLock(conn: Connection, userId: number): Promise<Question[]> {
        const connection = conn || this.tidb;
        const [rows] = await connection.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, hash, user_id AS userId, status, title, answer, revised_title AS revisedTitle, not_clear AS notClear,
                assumption, combined_title AS combinedTitle, sql_can_answer AS sqlCanAnswer, query_sql AS querySQL, query_hash AS queryHash, engines, plan,
                queue_name AS queueName, queue_job_id AS queueJobId, recommended_questions AS recommendedQuestions,
                result, chart, answer_summary AS answerSummary, recommended, hit_cache AS hitCache,
                created_at AS createdAt, requested_at AS requestedAt, executed_at AS executedAt, finished_at AS finishedAt,
                spent, error_type AS errorType, error
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
            sqlCanAnswer: row.sqlCanAnswer === 1,
            recommended: row.recommended === 1,
            hitCache: row.hitCache === 1,
            createdAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.createdAt) : undefined,
            requestedAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.requestedAt) : undefined,
            executedAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.executedAt) : undefined,
            finishedAt: row.createdAt instanceof Date ? DateTime.fromJSDate(row.finishedAt) : undefined,
        }
    }

    async countPrecedingQuestions(questionId: string, conn?: Connection): Promise<number> {
        const connection = conn || this.tidb;
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

            // Check if the result is empty.
            const hasQueryResult = Array.isArray(questionResult.result.rows) && questionResult.result.rows.length > 0;
            if (!hasQueryResult) {
                await this.addSystemQuestionFeedback(questionId, QuestionFeedbackType.ErrorEmptyResult, JSON.stringify(questionResult.result));
            }

            await this.saveQuestionResult(questionId, QuestionStatus.Success, {
                ...questionResult,
            }, false);

            return questionResult;
        } catch (err: any) {
            if (err instanceof ExplorerResolveQuestionError) {
                await this.addSystemQuestionFeedback(questionId, err.feedbackType, JSON.stringify(err.feedbackPayload));
                await this.saveQuestionError(questionId, err.feedbackType, err.message);
            } else {
                const userMessage = "Failed to resolve question, please try again later.";
                await this.addSystemQuestionFeedback(questionId, QuestionFeedbackType.ErrorUnknown, JSON.stringify({
                    message: err.message,
                }));
                await this.saveQuestionError(questionId, QuestionFeedbackType.ErrorUnknown, userMessage);
            }
            throw err;
        }
    }

    private async executeQuery(questionId: string, querySQL: string): Promise<QuestionQueryResult> {
        try {
            const executedAt = DateTime.now();
            await this.markQuestionRunning(questionId, executedAt);
            this.logger.info('⏳ Start query executing for question <%s>, start: %s', questionId, executedAt.toISO());

            const markedSQL = `/* questionId: ${questionId} */ ${querySQL}`;
            const [rows, fields] = await this.playgroundQueryExecutor.execute(`explorer-sql-${questionId}`, {
                sql: markedSQL,
                timeout: this.options.querySQLTimeout,
            }) as [any[], any[]];

            const finishedAt = DateTime.now();
            const spent = finishedAt.diff(executedAt).as("seconds");
            this.logger.info(
              '✅ Finished query executing for question <%s>, start: %s, end: %s, cost: %d s',
              questionId, executedAt.toISO(), finishedAt.toISO(), spent
            );

            return {
                result: {
                    fields,
                    rows
                },
                executedAt,
                finishedAt,
                spent,
            }
        } catch (err: any) {
            if (err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
                throw new ExplorerResolveQuestionError(err.sqlMessage, QuestionFeedbackType.ErrorQueryTimeout,{
                    querySQL,
                    message: err.message
                });
            } else if (err.sqlMessage) {
                throw new ExplorerResolveQuestionError(err.sqlMessage, QuestionFeedbackType.ErrorQueryExecute,{
                    querySQL,
                    sqlMessage: err.sqlMessage,
                    message: err.message
                });
            } else {
                throw new ExplorerResolveQuestionError(err.message, QuestionFeedbackType.ErrorQueryExecute,{
                    querySQL,
                    message: err.message
                });
            }
        }
    }

    private checkChart(chart: RecommendedChart | undefined | null, result: QuestionSQLResult): boolean {
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

                // Notice: the label column is optional.
                if (numberCard.label && !this.isValidColumn(numberCard.label, columnNames)) {
                    return false;
                }

                return this.isValidColumn(numberCard.value, columnNames);
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

    wrapperTheErrorMessage(message?: string | null): string {
        if (typeof message !== 'string') {
            return '';
        }

        if (message.includes('denied for user')) {
            message = 'Failed to execute SQL: commend access denied';
        } else if (message.includes('connect ECONNREFUSED')) {
            message = 'Failed to connect database, please try again later.';
        } else if (message.includes('rpc error: code = Unavailable')) {
            message= 'Failed to execute SQL, some of TiFlash nodes are unavailable, please try again later.';
        }

        return message;
    }

    // Recommend questions.

    async getTags(): Promise<QuestionTag[]> {
        const [rows] = await this.tidb.query<any[]>(`
            SELECT id, label, color, sort, created_at AS createdAt
            FROM explorer_question_tags eqt
            ORDER BY eqt.sort
        `);
        return this.mapQuestionTags(rows);
    }

    async getQuestionTags(conn: Connection, questionId: string): Promise<QuestionTag[]> {
        const [rows] = await conn.query<any[]>(`
            SELECT id, label, color, sort, created_at AS createdAt
            FROM explorer_question_tags eqt
            JOIN explorer_question_tag_rel eqtr ON eqtr.tag_id = eqt.id
            WHERE eqtr.question_id = UUID_TO_BIN(?)
        `, [questionId]);
        return this.mapQuestionTags(rows);
    }

    mapQuestionTags(rows: any[]): QuestionTag[] {
        return rows.map((r) => {
            return {
                ...r,
                createdAt: r.createdAt instanceof Date ? DateTime.fromJSDate(r.createdAt) : null,
            }
        });
    }

    async setQuestionTags(conn: Connection, questionId: string, newTagIds: number[]): Promise<void> {
      try {
        // Got existed tags.
        const existedTags = await this.getQuestionTags(conn, questionId);
        const existedTagIds = existedTags.map((t) => t.id);

        // Remove tags didn't exist in newTagIds.
        const needRemoveTagIds = existedTagIds.filter((id) => !newTagIds.includes(id));
        if (Array.isArray(needRemoveTagIds) && needRemoveTagIds.length > 0) {
          await conn.query(`
              DELETE
              FROM explorer_question_tag_rel eqtr
              WHERE eqtr.question_id = UUID_TO_BIN(?)
                AND eqtr.tag_id IN (?)
          `, [questionId, needRemoveTagIds]);
        }

        // Add tags didn't exist in existedTagIds.
        const needAddTags = newTagIds.filter((id) => !existedTagIds.includes(id));
        if (Array.isArray(needAddTags) && needAddTags.length > 0) {
          await conn.query(`
              INSERT INTO explorer_question_tag_rel (question_id, tag_id)
              VALUES ${needAddTags.map(() => '(UUID_TO_BIN(?), ?)').join(',')}
          `, needAddTags.map((id) => {
            return [questionId, id];
          }).flat());
        }
      } catch (err: any) {
        const message = 'Failed to set question tags.';
        this.logger.error({
          questionId: questionId,
          tagIds: newTagIds,
          err,
        }, message);
        throw new ExplorerSetQuestionTagsError(500, message, err);
      }
    }

    // Recommend questions.

    async getRecommendQuestionsByRandom(n: number, aiGenerated?: boolean): Promise<RecommendQuestion[]> {
        let questions = [];
        try {
            if (aiGenerated !== undefined) {
                [questions] = await this.tidb.query<any[]>(`
                SELECT hash, title, ai_generated AS aiGenerated, BIN_TO_UUID(question_id) AS questionId, created_at AS createdAt
                FROM explorer_recommend_questions erq
                WHERE ai_generated = ?
                ORDER BY RAND()
                LIMIT ?
            `, [aiGenerated, n]);
            } else {
                [questions] = await this.tidb.query<any[]>(`
                SELECT hash, title, ai_generated AS aiGenerated, BIN_TO_UUID(question_id) AS questionId, created_at AS createdAt
                FROM explorer_recommend_questions erq
                ORDER BY RAND()
                LIMIT ?
            `, [n]);
            }
        } catch (err: any) {
            this.logger.error(`Failed to get recommend questions: ${err.message}`);
        }

        return this.mapToRecommendQuestions(questions);
    }

    async getRecommendQuestionsByTag(n: number = 40, tagId: number | null = null): Promise<RecommendQuestion[]> {
        let questions: any[];
        if (tagId) {
            [questions] = await this.tidb.query<any[]>(`
                SELECT eq.hash, eq.title, false AS aiGenerated, BIN_TO_UUID(eq.id) AS questionId, eq.created_at AS createdAt
                FROM explorer_questions eq
                JOIN explorer_question_tag_rel eqtr ON eqtr.question_id = eq.id
                WHERE
                    recommended = 1
                    AND tag_id = ?
                ORDER BY RAND()
                LIMIT ?
            `, [tagId, n])
        } else {
            [questions] = await this.tidb.query<any[]>(`
                SELECT eq.hash, eq.title, false AS aiGenerated, BIN_TO_UUID(eq.id) AS questionId, eq.created_at AS createdAt
                FROM explorer_questions eq
                WHERE
                    recommended = 1
                ORDER BY RAND()
                LIMIT ?
            `, [n])
        }

        const questionIds = questions.map((q) => q.questionId);
        if (questionIds.length > 0) {
            const [questionTags] = await this.tidb.query<any[]>(`
                SELECT BIN_TO_UUID(question_id) AS questionId, eqt.id, eqt.label, eqt.color
                FROM explorer_question_tag_rel eqtr
                JOIN explorer_question_tags eqt ON eqt.id = eqtr.tag_id
                WHERE question_id IN (${
                  questionIds.map((id) => `UUID_TO_BIN('${id}')`).join(',')
                })
            `);

            questions.forEach((q) => {
                q.tags = questionTags.filter((qt) => qt.questionId === q.questionId).map((qt) => {
                    return {
                        id: qt.id,
                        label: qt.label,
                        color: qt.color,
                    }
                });
            });
        }

        return this.mapToRecommendQuestions(questions);
    }

    async mapToRecommendQuestions(rows: any[]): Promise<RecommendQuestion[]> {
        return rows.map((row) => ({
            hash: row.hash,
            title: row.title,
            aiGenerated: row.aiGenerated === 1,
            questionId: row.questionId,
            createdAt: DateTime.fromJSDate(row.createdAt),
            tags: row.tags || [],
        }));
    }

    async saveRecommendQuestions(questions: RecommendQuestion[]): Promise<void> {
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
        const [rs] = await this.tidb.query<ResultSetHeader>(`
            INSERT INTO explorer_recommend_questions(hash, title, ai_generated)
            VALUES ?
            ON DUPLICATE KEY UPDATE title = VALUES(title), ai_generated = VALUES(ai_generated)
        `, [questionValues]);
        if (rs.affectedRows === 0) {
            throw new APIError(500, 'Failed to save the recommend questions.');
        }
    }

    async recommendQuestion(questionId: string): Promise<void> {
        const question = await this.getQuestionByIdOrError(questionId);

        await withTransaction(this.tidb, async (conn) => {
          const hash = question?.hash;
          if (!hash) {
            throw new ExplorerRecommendQuestionError(401, 'Question hash is empty.');
          }

          const oldQuestions = await this.getRecommendedQuestionsByHash(conn, hash);
          const oldQuestionIds = oldQuestions.map((q) => q.id);
          let oldTagIds: number[] = [];
          if (Array.isArray(oldQuestionIds) && oldQuestionIds.length > 0) {
            // Get the old question tags.
            const [oldTagRows] = await conn.query<any[]>(`
              SELECT DISTINCT eqtr.tag_id AS tagId
              FROM explorer_question_tag_rel eqtr
              JOIN explorer_questions eq ON eq.id = eqtr.question_id
              WHERE
                eq.recommended = 1
                AND eqtr.question_id IN (${oldQuestionIds.map(() => `UUID_TO_BIN(?)`).join(',')})
            `, oldQuestionIds);
            oldTagIds = oldTagRows.map((row) => row.tagId);
            this.logger.info({questionId, hash, oldTagIds}, 'Get %d old question tags.', oldTagIds.length);

            // Unrecommended the old questions.
            const [rs] = await conn.query<ResultSetHeader>(`
              UPDATE explorer_questions eq
              SET recommended = 0
              WHERE
                recommended = 1
                AND eq.id IN (${oldQuestionIds.map(() => `UUID_TO_BIN(?)`).join(',')})
            `, oldQuestionIds);
            this.logger.info({questionId, hash}, 'Unrecommended the %d / %d old questions.', rs.affectedRows, oldQuestions.length);
          }

          // Recommended the new question.
          await conn.query(`
                UPDATE explorer_questions eq
                SET recommended = 1
                WHERE eq.id = UUID_TO_BIN(?)
            `, [questionId]);
          this.logger.info({questionId}, 'Recommended the new question.');

          // Migration the question tags.
          const questionTags = await this.getQuestionTags(conn, questionId);
          const existedTagIds = questionTags.map((qt) => qt.id);
          if (existedTagIds.length === 0 && oldTagIds.length > 0) {
            await this.setQuestionTags(conn, questionId, oldTagIds);
            this.logger.info({questionId, oldTagIds}, 'Migration the question tags.');
          }
        }, {
          onError: (con, err) => {
            if (err instanceof ExplorerRecommendQuestionError) {
              throw err;
            } else {
              const message = `Failed to recommended question.`;
              this.logger.error({questionId, err}, message);
              throw new ExplorerRecommendQuestionError(500, message, err);
            }
          }
        });
    }

    async cancelRecommendQuestion(questionId: string): Promise<void> {
        await withConnection(this.tidb, async (conn) => {
          const question = await this.getQuestionByIdOrError(questionId);
          await conn.query(`
              UPDATE explorer_questions eq
              SET recommended = 0
              WHERE eq.id = UUID_TO_BIN(?)
          `, question.id);
        }, {
          onError: (con, err) => {
            if (err instanceof APIError) {
              throw new ExplorerCancelRecommendQuestionError(err.statusCode, err.message, err.cause);
            } else {
              const message = `Failed to cancel recommended question.`;
              this.logger.error({questionId, err}, message);
              throw new ExplorerCancelRecommendQuestionError(500, message, err);
            }
          }
        });
    }

    async refreshRecommendQuestions(): Promise<void> {
        try {
            // TODO: remove the hard code 1000.
            const recommendQuestions = await this.getRecommendQuestionsByTag(1000);
            const batchJobId = randomUUID();
            const queue = async.queue<RecommendQuestion>((oldQuestion, callback) => {
                this.refreshRecommendQuestion(oldQuestion, batchJobId).then(() => {
                    callback();
                }).catch((err: any) => {
                    callback(err);
                });
            }, 3);

            await queue.push(recommendQuestions);
            await queue.drain();

            this.logger.info("Refresh %d recommended questions done.", recommendQuestions.length);
        } catch (err: any) {
            const message = `Failed to refresh recommended questions.`;
            this.logger.error({err}, message);
        }
    }

    async refreshRecommendQuestion(oldQuestion: RecommendQuestion, batchJobID: string): Promise<void> {
        try {
            this.logger.info({ questionId: oldQuestion.questionId }, "Refresh recommended question: %s.", oldQuestion.title);
            const newQuestion = await this.newQuestion(0, oldQuestion.title, true, true, true, batchJobID);

            // Prepare question async.
            if (newQuestion && !newQuestion.hitCache) {
                try {
                    await this.prepareQuestion(newQuestion);
                } catch (err: any) {
                    this.logger.error(err, `Failed to prepare question ${newQuestion.id}: ${err.message}`);
                }
            }
        } catch (err: any) {
            const message = `Failed to refresh recommended question: ${oldQuestion.title}`;
            this.logger.error({questionId: oldQuestion.questionId, err}, message);
        }
    }

    // Question feedback.

    async addSystemQuestionFeedback(questionId: string, feedbackType: QuestionFeedbackType, feedbackContent?: string) {
        await withConnection(this.tidb, async (conn) => {
          await this.addQuestionFeedback(conn, {
            userId: SYSTEM_USER_ID,
            questionId,
            satisfied: false,
            feedbackType,
            feedbackContent,
          });
        });
    }

    async cancelUserQuestionFeedback(userId: number, questionId: string, satisfied: boolean) {
        const [rs] = await this.tidb.query<ResultSetHeader>(`
            DELETE FROM explorer_question_feedbacks
            WHERE question_id = UUID_TO_BIN(?) AND user_id = ? AND satisfied = ?
            LIMIT 1
        `, [questionId, userId, satisfied]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to cancel the question feedback.');
        }
    }

    async removeUserQuestionFeedbacks(conn: Connection, userId: number, questionId: string) {
        await conn.query<ResultSetHeader>(`
            DELETE FROM explorer_question_feedbacks
            WHERE user_id = ? AND question_id = UUID_TO_BIN(?)
        `, [userId, questionId]);
    }

    async getUserQuestionFeedbacks(userId: number, questionId: string): Promise<QuestionFeedback[]> {
        const [rows] = await this.tidb.query<any[]>(`
            SELECT
                id, user_id AS userId, BIN_TO_UUID(question_id) AS questionId, satisfied, feedback_type AS feedbackType,
                feedback_content AS feedbackContent, created_at AS createdAt
            FROM explorer_question_feedbacks
            WHERE user_id = ? AND question_id = UUID_TO_BIN(?)
        `, [userId, questionId]);
        return rows;
    }

    async addQuestionFeedback(conn: Connection, feedback: Omit<QuestionFeedback, "id" | "createdAt">) {
        const { userId = 0, questionId, satisfied = false, feedbackType, feedbackContent = null } = feedback;
        const [rs] = await conn.query<ResultSetHeader>(`
            INSERT INTO explorer_question_feedbacks(user_id, question_id, satisfied, feedback_type, feedback_content)
            VALUES (?, UUID_TO_BIN(?), ?, ?, ?)
        `, [userId, questionId, satisfied, feedbackType, feedbackContent]);
        if (rs.affectedRows !== 1) {
            throw new APIError(500, 'Failed to add the question feedback.');
        }
    }

    // Trusted users.
    async checkIfTrustedUser(userId: number): Promise<boolean> {
        const [rows] = await this.tidb.query<any[]>(`
            SELECT user_id AS userId FROM explorer_trusted_users
            WHERE user_id = ?
        `, [userId]);
        return rows.length > 0;
    }

    async checkIfTrustedUsersOrError(userId: number) {
        const isTrustedUser = await this.checkIfTrustedUser(userId);
        if (!isTrustedUser) {
            throw new APIError(403, 'Has no permission to do this operation.');
        }
    }
}
