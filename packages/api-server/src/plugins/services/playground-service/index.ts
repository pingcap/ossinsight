import fp from "fastify-plugin";
import {MySQLPromisePool} from "@fastify/mysql";
import {QuestionContext} from "../bot-service";
import {Queue} from "bullmq";
import {APIError} from "../../../utils/error";
import {Connection, FieldPacket} from "mysql2/promise";
import pino from "pino";
import crypto from "node:crypto";
import {TiDBPlaygroundQueryExecutor} from "../../../core/executor/query-executor/TiDBPlaygroundQueryExecutor";
import {DateTime} from "luxon";
import {QueryExecution, QueryExecutionService, QueryStatus} from "../query-execution-service";
import CachedTableCacheProvider from "../../../core/cache/provider/CachedTableCacheProvider";
import IORedis from "ioredis";
import {CacheProvider} from "../../../core/cache/provider/CacheProvider";
import {AST, Parser, Select} from "node-sql-parser";

export const PLAYGROUND_SQL_QUEUE_NAME = "playground-sql";
export const PLAYGROUND_SQL_CACHE_TTL = 5 * 60;     // 5 minutes.
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
    context: QuestionContext | null;
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
    execution?: QueryResultExecution;
}

export interface QueryResultExecution {
    id: number;
    status: QueryStatus;
    queryHash: string;
    queryDigest?: string | null;
    engines: string[],
    hitCache: boolean;
    enqueue: boolean;
    queueName?: string;
    queueJobId?: string;
    queueWaiting?: number;
    error?: string;
}

export interface ValidateSQLResult {
    sql: string;
    statementType: string;
}

export default fp(async (app) => {
    const { mysql, redis, queryExecutionService, playgroundQueryExecutor } = app;
    app.decorate('playgroundService', new PlaygroundService(
        mysql, queryExecutionService, playgroundQueryExecutor, redis
    ));
}, {
    name: 'playground-service',
    dependencies: [
        '@fastify/env',
        '@fastify/mysql',
        'query-execution-service'
    ]
});

export class PlaygroundService {
    private readonly logger: pino.Logger;
    private readonly playgroundSQLQueue: Queue;
    // TODO: replace node-sql-parser with tidb-sql-parser.
    private sqlParser: Parser;
    constructor(
        private readonly dbPool: MySQLPromisePool,
        private readonly queryExecutionService: QueryExecutionService,
        private readonly playgroundQueryExecutor: TiDBPlaygroundQueryExecutor,
        redisClient: IORedis
    ) {
        this.playgroundSQLQueue = new Queue(PLAYGROUND_SQL_QUEUE_NAME, {
            connection: redisClient
        });
        this.logger = pino().child({
            name: 'playground-service',
        });
        this.sqlParser = new Parser();
    }

    async executeSQL(sql: string, cancelPrevious: boolean, userId?: number, ip?: string): Promise<QueryResult> {
        const queryHash = this.getQueryHash(sql);
        const queryDigest = this.getQueryDigest(sql);
        const cacheKey = `playground:${queryHash}`;
        const conn =  await this.dbPool.getConnection();

        try {
            const { sql: querySQL, statementType } = this.validateSQL(sql);

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
                engines = await this.getStorageEnginesFromPlan(planSteps);
            }

            // If the query uses TiFlash, we need to enqueue it to the queue.
            const enqueue = engines.includes('tiflash');

            // Try to get the query result from cache.
            const cache = new CachedTableCacheProvider(conn);
            if (enqueue) {
                const cachedValue = await this.getQueryResultFromCache(conn, cache, cacheKey, userId, ip);
                if (cachedValue) {
                    return cachedValue;
                }
            }

            // Create a new query execution.
            const execution = await this.queryExecutionService.createQueryExecution(conn, {
                id: 0,
                userId: userId,
                ip: ip,
                querySQL: querySQL,
                queryHash: queryHash,
                queryDigest: queryDigest,
                status: enqueue ? QueryStatus.Waiting : QueryStatus.Running,
                enqueue: enqueue,
                engines: engines,
                hitCache: false,
                requestedAt: DateTime.now(),
                executedAt: null,
                finishedAt: null,
            });

            // Execute the query in different ways.
            let res;
            if (enqueue) {
                res = await this.executeSQLInQueue(this.playgroundSQLQueue, execution);
            } else {
                res = await this.executeSQLImmediately(conn, cache, cacheKey, execution);
            }
            return res;
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
        const { engines, queryHash, queryDigest } = execution as QueryResultExecution;
        const requestedAtValue = typeof requestedAt === 'string' ? DateTime.fromISO(requestedAt) : null;
        const executedAtValue = typeof executedAt === 'string' ? DateTime.fromISO(executedAt) : null;
        const finishedAtValue = typeof finishedAt === 'string' ? DateTime.fromISO(finishedAt) : null;

        const newExecution = await this.queryExecutionService.createQueryExecution(conn, {
            id: 0,
            userId: userId,
            ip: ip,
            querySQL: sql,
            queryHash: queryHash,
            queryDigest: queryDigest,
            status: QueryStatus.Success,
            enqueue: true,
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

    async executeSQLInQueue(queue: Queue, execution: QueryExecution): Promise<QueryResult> {
        const job = await queue.add(PLAYGROUND_SQL_QUEUE_NAME, execution);
        if (!job.id) {
            throw new APIError(500, 'Failed to add query job to queue.');
        }
        const waiting = await queue.getWaitingCount();
        const { id, status, queryHash, queryDigest, engines, hitCache, enqueue } = execution;

        return {
            sql: execution.querySQL,
            execution: {
                id,
                status,
                queryHash,
                queryDigest,
                engines,
                hitCache,
                enqueue,
                queueWaiting: waiting,
            }
        };
    }

    async executeSQLImmediately(conn: Connection, cache: CacheProvider, cacheKey: string, execution: QueryExecution): Promise<QueryResult> {
        const { id: executionId, querySQL, queryHash, queryDigest, engines, enqueue, requestedAt } = execution;

        try {
            // Get connection.
            const getConnStart = DateTime.now();
            const playgroundConn = await this.playgroundQueryExecutor.getConnection();
            const getConnEnd = DateTime.now();
            this.logger.info(`get playground connection: ${getConnEnd.diff(getConnStart).as('milliseconds')}ms`);

            // Execute the query.
            let executedAt, finishedAt, rows: any[] = [], fields: FieldPacket[] = [];
            try {
                executedAt = DateTime.now();
                [rows, fields] = await playgroundConn.execute<any[]>(querySQL);
                finishedAt = DateTime.now();
            } finally {
                playgroundConn.release();
            }
            const spent = finishedAt.diff(executedAt).as("seconds");

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
                    enqueue: enqueue,
                    queueWaiting: 0
                }
            };
            await cache.set(cacheKey, JSON.stringify(res), {
                EX: PLAYGROUND_SQL_CACHE_TTL,
            });
            await this.queryExecutionService.finishQueryExecution(conn, {
                id: executionId,
                status: QueryStatus.Success,
                executedAt,
                finishedAt,
                spent
            });

            return res;
        } catch (err: any) {
            await this.queryExecutionService.finishQueryExecution(conn, {
                id: executionId,
                status: QueryStatus.Error,
                error: err.message,
            });
            throw err;
        }
    }

    getQueryHash(sql: string): string {
        sql.replaceAll(/\s+/g, ' ');
        return crypto.createHash('sha256').update(sql, 'binary').digest('hex');
    }

    getQueryDigest(sql: string): string | null {
        return null;
    }

    async getQueryResult(executionId: number) {
        const conn =  await this.dbPool.getConnection();

        try {
            const queryExecution = await this.queryExecutionService.getQueryExecution(conn, executionId);
            if (!queryExecution) {
                throw new APIError(404, 'Query execution not found.');
            }
            const { status, queryHash, querySQL, requestedAt, enqueue, error } = queryExecution;

            switch (status) {
                case QueryStatus.Waiting:
                    const waiting = await this.playgroundSQLQueue.getWaitingCount();
                    return {
                        sql: querySQL,
                        requestedAt,
                        execution: {
                            executionId,
                            status,
                            enqueue,
                            waiting,
                        }
                    }
                case QueryStatus.Running:
                    return {
                        sql: querySQL,
                        requestedAt,
                        execution: {
                            executionId,
                            status,
                            enqueue,
                            queueWaiting: 0,
                        }
                    }
                case QueryStatus.Success:
                    const cacheProvider = new CachedTableCacheProvider(conn);
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
                        execution: {
                            executionId,
                            status,
                            error,
                            enqueue,
                            queueWaiting: 0
                        }
                    }
                default:
                    throw new APIError(500, 'Unexpected query execution status.');
            }
        } finally {
            await conn.release();
        }
    }

    async getStorageEnginesFromPlan(steps: PlanStep[]):Promise<string[]> {
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

    async recordQuestion(questionRecord: QuestionRecord):Promise<void> {
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
