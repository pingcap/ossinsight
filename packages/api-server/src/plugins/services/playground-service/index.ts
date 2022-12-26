import fp from "fastify-plugin";
import {MySQLPromisePool} from "@fastify/mysql";
import {Queue} from "bullmq";
import {APIError} from "../../../utils/error";
import {Connection} from "mysql2/promise";
import pino from "pino";
import crypto from "node:crypto";
import {TiDBPlaygroundQueryExecutor} from "../../../core/executor/query-executor/TiDBPlaygroundQueryExecutor";
import {DateTime} from "luxon";
import {QueryExecution, QueryExecutionService, QueryExecutionVO, QueryStatus} from "../query-execution-service";
import {CacheProvider} from "../../../core/cache/provider/CacheProvider";
import {AST, Parser, Select} from "node-sql-parser";
import NormalTableCacheProvider from "../../../core/cache/provider/NormalTableCacheProvider";
import {randomUUID} from "crypto";

export const PLAYGROUND_QUEUE_NAME = "playground";
export const PLAYGROUND_CACHE_TTL = 5 * 60;     // 5 minutes.
export const MAX_SELECT_LIMIT = 200;

declare module 'fastify' {
    interface FastifyInstance {
        playgroundService: PlaygroundService;
    }
}

declare module "node-sql-parser" {
    interface Select {
        _next?: AST;
        union?: string;
    }
}

export interface QuestionRecord {
    userId: number;
    context: Record<string, any> | null;
    question: string;
    sql: string | null;
    success: boolean;
    preset: boolean;
}

export interface PlanStep {
    id: number;
    estRows: number;
    actRows?: number;
    task: string;
    accessObject: string;
}

export interface QueryResult {
    sql: string;
    params?: Record<string, any>;
    fields?: any[];
    data?: any[];
    requestedAt?: DateTime | null;
    executedAt?: DateTime | null;
    finishedAt?: DateTime | null;
    spent?: number;
    execution?: QueryExecutionVO;
}

export interface ValidateSQLResult {
    sql: string;
    statementType: string;
}

export default fp(async (app) => {
    const { mysql, redis, queryExecutionService, playgroundQueryExecutor } = app;

    const playgroundQueue = new Queue(PLAYGROUND_QUEUE_NAME, {
        connection: redis,
    });
    app.decorate('playgroundService', new PlaygroundService(
        mysql, queryExecutionService, playgroundQueryExecutor, playgroundQueue
    ));
}, {
    name: '@ossinsight/playground-service',
    dependencies: [
        '@fastify/env',
        '@fastify/mysql',
        'fastify-redis',
        '@ossinsight/query-execution-service'
    ]
});

export class PlaygroundService {
    private readonly logger: pino.Logger;
    // TODO: replace node-sql-parser with tidb-sql-parser.
    private sqlParser: Parser;
    constructor(
        private readonly dbPool: MySQLPromisePool,
        private readonly queryExecutionService: QueryExecutionService,
        private readonly playgroundQueryExecutor: TiDBPlaygroundQueryExecutor,
        private readonly playgroundQueue: Queue
    ) {
        this.logger = pino().child({
            name: 'playground-service',
        });
        this.sqlParser = new Parser();
    }

    // SQL execution.
    async submitQueryJob(sql: string, cancelPrevious: boolean, userId?: number, ip?: string): Promise<QueryResult> {
        const queryHash = this.getQueryHash(sql);
        const queryDigest = this.getQueryDigest(sql);
        const cacheKey = `playground:${queryHash}`;
        const conn =  await this.dbPool.getConnection();

        try {
            const { sql: querySQL, statementType } = this.validateSQL(sql);

            // Try to get the query result from cache.
            const cache = new NormalTableCacheProvider(conn);
            const cachedValue = await this.getQueryResultFromCache(conn, cache, cacheKey, userId, ip);
            if (cachedValue) {
                return cachedValue;
            }

            // Check if there is a previous query.
            const existedExecutions = await this.queryExecutionService.findExistedQueryExecutions(conn, userId, ip);
            if (existedExecutions.length > 0) {
                if (cancelPrevious) {
                    await this.queryExecutionService.cancelPrevQueryExecution(conn, existedExecutions);
                } else {
                    throw new APIError(409, 'You have a running query, please wait for it to finish.');
                }
            }

            // Check if the query uses TiFlash.
            let engines: string[] = [];
            if (statementType === 'select') {
                const [planSteps] = await conn.query<any[]>(`EXPLAIN format = 'brief' ${querySQL}`);
                engines = this.getStorageEnginesFromPlan(planSteps);
            }

            // Create a new query execution.
            const execution = await this.queryExecutionService.createQueryExecution(conn, {
                id: randomUUID(),
                userId: userId,
                ip: ip,
                querySQL: querySQL,
                queryHash: queryHash,
                queryDigest: queryDigest,
                status: QueryStatus.Waiting,
                engines: engines,
                queueInitialRank: 0,
                queueCurrentRank: 0,
                hitCache: false,
                requestedAt: DateTime.now(),
                executedAt: null,
                finishedAt: null,
            });

            const job = await this.playgroundQueue.add(PLAYGROUND_QUEUE_NAME, execution);
            if (!job.id) {
                throw new APIError(500, 'Failed to add query job to queue.');
            }

            const initialRank = await this.getQueueRank(job.id);
            await this.queryExecutionService.updateQueryExecution(conn, execution.id, {
                queueJobId: job.id,
                queueInitialRank: initialRank,
                queueCurrentRank: initialRank,
            });

            return {
                sql: execution.querySQL,
                execution: {
                    ...this.queryExecutionService.toQueryExecutionVO(execution),
                    queueJobId: job.id,
                    queueInitialRank: initialRank,
                    queueCurrentRank: initialRank,
                }
            };
        } finally {
            await conn.release();
        }
    }

    validateSQL(sql: string): ValidateSQLResult {
        // Notice: node-sql-parser doesn't support `SHOW INDEXES FROM` syntax.
        if (/^show\s+indexes\s+from\s+\S+/igm.test(sql)) {
            return {
                sql: sql,
                statementType: 'show',
            };
        }

        try {
            const ast = this.sqlParser.astify(sql);
            let rootNode;
            if (Array.isArray(ast)) {
                if (ast.length > 1) {
                    throw new APIError(400, 'SQL playground didn\'t support multiple statements.');
                } else {
                    rootNode = ast[0];
                }
            } else {
                rootNode = ast;
            }

            switch (rootNode.type.toLowerCase()) {
                case 'select':
                    const newAst = this.addLimitToSQL(rootNode as Select, MAX_SELECT_LIMIT, 0);
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
                    throw new APIError(400, 'SQL playground only supports SELECT, SHOW and DESC statements.');
            }
        } catch (err) {
            if (err instanceof APIError) {
                throw err;
            }

            throw new APIError(400, 'SQL playground only supports SELECT, SHOW and DESC statements.');
        }
    }

    addLimitToSQL(rootNode: Select, maxLimit: number, depth: number): Select {
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

    async getQueryResultFromCache(conn: Connection, cache: CacheProvider, cacheKey: string, userId?: number, ip?: string): Promise<QueryResult | null> {
        const cachedValue = await cache.get(cacheKey);
        if (!cachedValue) {
            return null;
        }

        const queryResult = typeof cachedValue === 'string' ? JSON.parse(cachedValue) : cachedValue;
        const { sql, requestedAt, executedAt, finishedAt, spent, execution } = queryResult;
        const { engines, queryHash, queryDigest } = execution;
        const requestedAtValue = typeof requestedAt === 'string' ? DateTime.fromISO(requestedAt) : null;
        const executedAtValue = typeof executedAt === 'string' ? DateTime.fromISO(executedAt) : null;
        const finishedAtValue = typeof finishedAt === 'string' ? DateTime.fromISO(finishedAt) : null;

        const newExecution = await this.queryExecutionService.createQueryExecution(conn, {
            id: randomUUID(),
            userId: userId,
            ip: ip,
            querySQL: sql,
            queryHash: queryHash,
            queryDigest: queryDigest,
            status: QueryStatus.Success,
            queueCurrentRank: 0,
            queueInitialRank: 0,
            hitCache: true,
            engines,
            requestedAt: requestedAtValue,
            executedAt: executedAtValue,
            finishedAt: finishedAtValue,
            spent: spent,
        });

        queryResult.execution.hitCache = true;
        queryResult.execution.enqueue = false;
        queryResult.execution.id = newExecution.id;

        return queryResult;
    }

    async executeSQL(cache: CacheProvider, cacheKey: string, execution: QueryExecution): Promise<QueryResult> {
        const { id: executionId, querySQL, queryHash, queryDigest, engines, queueJobId, requestedAt, queueInitialRank } = execution;

        // Get playground connection.
        const getConnStart = DateTime.now();
        const playgroundConn = await this.playgroundQueryExecutor.getConnection();
        const getConnEnd = DateTime.now();
        this.logger.info({ cacheKey }, `Got the playground connection, cost: ${getConnEnd.diff(getConnStart).as('milliseconds')} ms`);

        // Execute query.
        try {
            this.logger.info({ cacheKey, querySQL }, 'Executing query execution: %s', executionId);
            const executedAt = DateTime.now();
            const [rows, fields] = await playgroundConn.execute<any[]>(querySQL);
            const finishedAt = DateTime.now();
            const spent = finishedAt.diff(executedAt).as("seconds");
            this.logger.info({ cacheKey }, 'Finished executing query execution: %s', executionId);

            const res = {
                sql: querySQL,
                params: [],
                fields: fields.map((field) => {
                    return {
                        name: field.name,
                        columnType: field.type
                    }
                }),
                data: rows,
                requestedAt,
                executedAt,
                finishedAt,
                spent,
                execution: {
                    id: executionId,
                    status: QueryStatus.Success,
                    queryHash: queryHash,
                    queryDigest: queryDigest,
                    engines: engines,
                    hitCache: false,
                    queueJobId: queueJobId,
                    queueInitialRank: queueInitialRank,
                    queueCurrentRank: 1,
                }
            };
            await cache.set(cacheKey, JSON.stringify(res), {
                EX: PLAYGROUND_CACHE_TTL,
            });
            return res;
        } catch (err: any) {
            this.logger.error({ cacheKey, err }, 'Failed to execute query execution: %d.', executionId);
            throw err;
        } finally {
            playgroundConn.release();
        }
    }

    async getQueryResult(conn: Connection, executionId: string) {
        const queryExecution = await this.queryExecutionService.getQueryExecution(conn, executionId);
        if (!queryExecution) {
            throw new APIError(404, 'Query execution not found.');
        }
        const { queueJobId, status, queryHash, querySQL, requestedAt } = queryExecution;
        const queryExecutionVO = this.queryExecutionService.toQueryExecutionVO(queryExecution);

        switch (status) {
            case QueryStatus.Waiting:
                let currentRank = null;
                if (queueJobId) {
                    currentRank = this.getQueueRank(queueJobId)
                }

                return {
                    sql: querySQL,
                    requestedAt,
                    execution: {
                        ...queryExecutionVO,
                        queueCurrentRank: currentRank
                    }
                }
            case QueryStatus.Running:
                return {
                    sql: querySQL,
                    requestedAt,
                    execution: {
                        ...queryExecutionVO,
                        queueCurrentRank: 1,
                    }
                }
            case QueryStatus.Success:
                const cacheProvider = new NormalTableCacheProvider(conn);
                const cacheKey = `playground:${queryHash}`;
                const cacheValue = await cacheProvider.get(cacheKey);
                if (typeof cacheValue === 'string') {
                    return JSON.parse(cacheValue)
                } else if (typeof cacheValue === 'object') {
                    return cacheValue;
                } else {
                    return null;
                }
            case QueryStatus.Error:
                return {
                    sql: querySQL,
                    requestedAt,
                    execution: queryExecutionVO,
                }
            case QueryStatus.Cancel:
                return {
                    sql: querySQL,
                    requestedAt,
                    execution: queryExecutionVO
                }
            default:
                throw new APIError(500, 'Unexpected query execution status.');
        }
    }

    async getQueueRank(queueJobId: string) {
        const waiting = await this.playgroundQueue.getWaiting();
        return waiting.filter((item) => Number(item.id || "0") <= Number(queueJobId || "0")).length;
    }

    // Query information.

    getQueryHash(sql: string): string {
        sql.replaceAll(/\s+/g, ' ');
        return crypto.createHash('sha256').update(sql, 'binary').digest('hex');
    }

    getQueryDigest(sql: string): string | null {
        return null;
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

    // Question records.

    normalizeQuestion(question: string): string {
        return question.replaceAll(/\s+/g, ' ');
    }

    async getExistedQuestion(question: string):Promise<QuestionRecord[]> {
        question = this.normalizeQuestion(question);
        // Notice: sql is a reserved word in TiDB.
        const [records] = await this.dbPool.query<any[]>(`
            SELECT id, user_id AS userId, context, question, \`sql\`, success, preset, requested_at AS requestedAt
            FROM playground_question_records pqr
            WHERE success = true AND question = ?
        `, [question]);
        return records;
    }

    async recordQuestion(questionRecord: Record<string, any>):Promise<void> {
        const { userId, context, question, sql, success, preset } = questionRecord;
        let contextJSON = null;
        if (context) {
            contextJSON = JSON.stringify(context);
        }
        // Notice: sql is a reserved word in TiDB.
        await this.dbPool.query(`
            INSERT INTO playground_question_records (user_id, context, question, \`sql\`, success, preset)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, contextJSON, question, sql, success, preset]);
    }

    async countTodayQuestionRequests(userId: number, preset: boolean):Promise<number> {
        const [result] = await this.dbPool.query<any[]>(`
            SELECT COUNT(*) AS count
            FROM playground_question_records pqr
            WHERE
                user_id = ?
                AND preset = ?
                AND requested_at BETWEEN DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(NOW(), '%Y-%m-%d 23:59:59');
        `, [userId, preset]);
        return result[0].count;
    }

}
