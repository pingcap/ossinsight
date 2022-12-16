import fp from "fastify-plugin";
import {MySQLPromisePool} from "@fastify/mysql";
import {QuestionContext} from "../bot-service";
import {Queue} from "bullmq";
import {APIError} from "../../../utils/error";
import {Connection} from "mysql2/promise";
import {Parser} from "../../../core/playground/parser";
import pino from "pino";
import crypto from "node:crypto";
import {TiDBPlaygroundQueryExecutor} from "../../../core/executor/query-executor/TiDBPlaygroundQueryExecutor";
import {DateTime} from "luxon";
import {QueryExecution, QueryExecutionService, QueryStatus} from "../query-execution-service";
import CachedTableCacheProvider from "../../../core/cache/provider/CachedTableCacheProvider";

// @ts-ignore
globalThis.crypto = require('node:crypto').webcrypto;
const parserWasm = require('tidb-sql-parser');

export const PLAYGROUND_SQL_QUEUE_NAME = "playground-sql";
export const PLAYGROUND_SQL_CACHE_TTL = 10 * 60 * 1000;     // 10 minutes.

declare module 'fastify' {
    interface FastifyInstance {
        playgroundService: PlaygroundService;
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
    stats?: QueryResultStats;
    execution?: QueryResultExecution;
}

export interface QueryResultStats {
    requestedAt: DateTime;
    executedAt: DateTime;
    finishedAt: DateTime;
    spent: number;
}

export interface QueryResultExecution {
    status: QueryStatus;
    executionId: number;
    queryHash: string;
    queryDigest?: string | null;
    useTiFlash: boolean;
    enqueue: boolean;
    queueName?: string;
    queueJobId?: string;
    queueWaiting?: number;
    error?: string;
}

export default fp(async (app) => {
    app.decorate('playgroundService', new PlaygroundService(app.mysql, app.queryExecutionService, app.playgroundQueryExecutor));
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
    private tidbParser: Parser | null = null;
    private readonly initPromise: Promise<boolean>;
    constructor(
        private readonly dbPool: MySQLPromisePool,
        private readonly queryExecutionService: QueryExecutionService,
        private readonly playgroundQueryExecutor: TiDBPlaygroundQueryExecutor,
    ) {
        this.playgroundSQLQueue = new Queue(PLAYGROUND_SQL_QUEUE_NAME);
        this.logger = pino().child({
            name: 'playground-service',
        });
        this.initPromise = new Promise(async (resolve, reject) => {
            try {
                const parserInstance = await parserWasm.initWasm();
                this.tidbParser = parserInstance.NewParser();
                resolve(true);
            } catch (err) {
                this.logger.error(err,'failed to initialize playground service: ');
                reject(err);
            }
        });
    }

    async ready():Promise<boolean> {
        return this.initPromise;
    }

    async executeSQL(sql: string, cancelPrevious: boolean, userId?: number, ip?: string): Promise<QueryResult> {
        await this.ready();

        console.time("get-query-hash");
        const queryHash = this.getQueryHash(sql);
        console.timeEnd("get-query-hash");
        console.time("get-query-digest");
        const queryDigest = this.getQueryDigest(sql);
        console.timeEnd("get-query-digest");
        console.time("get-connection");
        const conn =  await this.dbPool.getConnection();
        console.timeEnd("get-connection");

        try {
            // Check if there is a previous query.
            console.time("get-existed-execution");
            const existedExecutions = await this.queryExecutionService.findExistedQueryExecutions(conn, userId, ip);
            if (existedExecutions.length > 0) {
                if (cancelPrevious) {
                    await this.queryExecutionService.cancelPrevQueryExecution(conn, existedExecutions);
                } else {
                    throw new APIError(409, 'You have a running query, please wait for it to finish.');
                }
            }
            console.timeEnd("get-existed-execution");

            // Check if the query uses TiFlash.
            console.time("explain-sql");
            const [planLines] = await conn.query<any[]>(`EXPLAIN format = 'brief' ${sql}`);
            const useTiFlash = await this.willQueryUseTiFlash(planLines);
            console.timeEnd("explain-sql");

            // Create a new query execution.
            console.time("create-query-execution");
            const execution = await this.queryExecutionService.createQueryExecution(conn, {
                userId: userId,
                ip: ip,
                queryHash: queryHash,
                queryDigest: queryDigest,
                sql: sql,
                status: useTiFlash ? QueryStatus.Waiting : QueryStatus.Running,
                useTiFlash: useTiFlash,
                requestedAt: DateTime.now()
            });
            console.timeEnd("create-query-execution");

            // Execute the query in different ways.
            let res;
            if (useTiFlash) {
                res = await this.executeSQLInQueue(this.playgroundSQLQueue, execution);
            } else {
                res = await this.executeSQLImmediately(conn, execution);
            }
            return res;
        } finally {
            await conn.release();
        }
    }

    async executeSQLInQueue(queue: Queue, execution: QueryExecution): Promise<QueryResult> {
        const job = await queue.add(PLAYGROUND_SQL_QUEUE_NAME, execution);
        if (!job.id) {
            throw new APIError(500, 'Failed to add query job to queue.');
        }
        const waiting = await queue.getWaitingCount();

        return {
            sql: execution.sql,
            execution: {
                executionId: execution.id,
                queryHash: execution.queryHash,
                queryDigest: execution.queryDigest,
                status: execution.status,
                useTiFlash: execution.useTiFlash,
                enqueue: true,
                queueName: PLAYGROUND_SQL_QUEUE_NAME,
                queueWaiting: waiting,
            }
        };
    }

    async executeSQLImmediately(conn: Connection, execution: QueryExecution): Promise<QueryResult> {
        const { id: executionId, sql, queryHash, queryDigest, requestedAt, useTiFlash, enqueue = false } = execution;
        const cacheKey = `playground:${queryHash}`;

        try {
            const cache = new CachedTableCacheProvider(conn);
            const cachedValue = await cache.get(cacheKey);

            if (cachedValue) {
                // If the query result is cached, return it directly.
                const queryResult = typeof cachedValue === 'string' ? JSON.parse(cachedValue) : cachedValue;
                const { stats } = queryResult;
                const executedAt = DateTime.fromISO(stats?.executedAt);
                const finishedAt = DateTime.fromISO(stats?.finishedAt);
                await this.queryExecutionService.finishQueryExecution(conn, {
                    id: executionId,
                    status: QueryStatus.Success,
                    executedAt,
                    finishedAt,
                });
                return queryResult;
            } else {
                // If the query result is not cached, execute it and cache the result.
                console.time("execute-query");
                const executedAt = DateTime.now();
                const [rows, fields] = await this.playgroundQueryExecutor.execute<any[]>(cacheKey, sql);
                const finishedAt = DateTime.now();
                console.timeEnd("execute-query");

                const res = {
                    sql,
                    params: [],
                    fields,
                    data: rows,
                    stats: {
                        requestedAt: requestedAt,
                        executedAt: executedAt,
                        finishedAt: finishedAt,
                        spent: finishedAt.diff(executedAt).as("seconds"),
                    },
                    execution: {
                        executionId,
                        status: QueryStatus.Success,
                        useTiFlash,
                        queryHash,
                        queryDigest,
                        enqueue,
                    }
                };
                await cache.set(cacheKey, JSON.stringify(res), {
                    EX: PLAYGROUND_SQL_CACHE_TTL,
                });
                await this.queryExecutionService.finishQueryExecution(conn, {
                    id: executionId,
                    status: QueryStatus.Success,
                    executedAt: executedAt,
                    finishedAt: finishedAt
                });

                return res;
            }
        } catch (err) {
            await this.queryExecutionService.finishQueryExecution(conn, {
                id: executionId,
                status: QueryStatus.Error,
            });
            throw err;
        }
    }

    getQueryHash(sql: string): string {
        sql.replaceAll(/\s+/g, ' ');
        return crypto.createHash('sha256').update(sql, 'binary').digest('hex');
    }

    getQueryDigest(sql: string): string | null {
        if (this.tidbParser) {
            return this.tidbParser.NormalizeDigest(sql).Digest
        }
        return null;
    }

    async getQueryResult(executionId: number) {
        const conn =  await this.dbPool.getConnection();

        try {
            const queryExecution = await this.queryExecutionService.getQueryExecution(conn, executionId);
            if (!queryExecution) {
                throw new APIError(404, 'Query execution not found.');
            }
            const { status, queryHash, sql, requestedAt } = queryExecution;

            switch (status) {
                case QueryStatus.Waiting || QueryStatus.Running:
                    const waiting = await this.playgroundSQLQueue.getWaitingCount();
                    return {
                        sql,
                        requestedAt,
                        execution: {
                            executionId,
                            status,
                            inQueue: true,
                            waiting,
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
                        sql,
                        requestedAt,
                        execution: {
                            executionId,
                            status,
                            error: 'TODO',
                            inQueue: false,
                        }
                    }
                default:
                    throw new APIError(500, 'Unexpected query execution status.');
            }
        } finally {
            await conn.release();
        }
    }

    async saveQueryResult() {

    }

    async getQueryExecutionPlan(digest: string) {
        const conn =  await this.dbPool.getConnection();

        try {
            const [rows] = await conn.query<any[]>(`
                SELECT plan
                FROM information_schema.CLUSTER_STATEMENTS_SUMMARY
                WHERE digest = ?
                LIMIT 1;
            `, digest);
            if (rows.length === 0) {
                throw new APIError(404, 'Query execution plan not found.');
            }
            return {
                plan: rows[0].plan
            };
        } finally {
            await conn.release();
        }
    }

    async willQueryUseTiFlash(explainResult: PlanStep[]):Promise<boolean> {
        if (!Array.isArray(explainResult)) return false;

        for (const step of explainResult) {
            if (step.task.includes('tiflash')) {
                return true;
            }
        }

        return false;
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
