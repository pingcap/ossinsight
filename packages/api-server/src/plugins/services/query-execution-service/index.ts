import {Connection, ResultSetHeader} from "mysql2/promise";
import {APIError} from "../../../utils/error";
import fp from "fastify-plugin";
import {DateTime} from "luxon";

export interface QueryExecution {
    id: string;
    // Identifier of the query requester.
    userId?: number | null;
    ip?: string | null;
    // The SQL statement.
    querySQL: string;
    queryHash: string;
    queryDigest?: string | null;
    // Execution info.
    status: QueryStatus;
    engines: string[];
    queueJobId?: string | null;
    queueInitialRank: number;
    queueCurrentRank: number;
    hitCache: boolean;
    error?: string;
    // Stats.
    requestedAt?: DateTime | null;
    executedAt?: DateTime | null;
    finishedAt?: DateTime | null;
    spent?: number | null;
}

export type QueryExecutionVO = Omit<QueryExecution, "userId" | "ip" | "querySQL" | "requestedAt" | "executedAt" | "finishedAt">

export type CreateQueryExecutionDTO = Omit<QueryExecution, "queueJobId">

export type UpdateQueryExecutionDTO = Pick<QueryExecution, "queueJobId" | "queueInitialRank" | "queueCurrentRank">;

export type FinishedQueryExecutionDTO = Pick<QueryExecution, "id" | "executedAt" | "finishedAt" | "status" | "error" | "spent">;

export enum QueryStatus {
    Waiting = "waiting",
    Running = "running",
    Success = "success",
    Error = "error",
    Cancel = "cancel",
}

declare module 'fastify' {
    interface FastifyInstance {
        queryExecutionService: QueryExecutionService;
    }
}

export default fp(async (app) => {
    app.decorate('queryExecutionService', new QueryExecutionService());
}, {
    name: '@ossinsight/query-execution-service',
    dependencies: [
        '@fastify/env'
    ]
});

export class QueryExecutionService {

    async createQueryExecution(conn: Connection, executionDTO: CreateQueryExecutionDTO):Promise<QueryExecution> {
        const {
            id, userId = 0, ip = 'N/A', querySQL, queryHash, queryDigest,
            status = QueryStatus.Waiting, engines = [], queueInitialRank = 0, queueCurrentRank = 0,
            hitCache = false, error = null, requestedAt = DateTime.now(), executedAt = null, finishedAt = null, spent = null
        } = executionDTO;
        const enginesValue = Array.isArray(engines) ? JSON.stringify(engines) : null;
        const requestedAtValue = requestedAt ? requestedAt.toSQL() : null;
        const executedAtValue = executedAt ? executedAt.toSQL() : null;
        const finishedAtValue = finishedAt ? finishedAt.toSQL() : null;
        await conn.query<ResultSetHeader>(`
            INSERT INTO playground_query_executions(
                id, user_id, ip, query_sql, query_hash, query_digest, 
                status, engines, queue_initial_rank, queue_current_rank, hit_cache, error, 
                requested_at, executed_at, finished_at, spent
            ) VALUES (
                UUID_TO_BIN(?), ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?
            )
        `, [
            id, userId, ip, querySQL, queryHash, queryDigest,
            status, enginesValue, queueInitialRank, queueCurrentRank, hitCache, error,
            requestedAtValue, executedAtValue, finishedAtValue, spent
        ]);
        return {
            ...executionDTO,
        };
    }

    async updateQueryExecution(conn: Connection, executionId: string, executionDTO: UpdateQueryExecutionDTO): Promise<void> {
        const { queueJobId, queueInitialRank, queueCurrentRank } = executionDTO;
        await conn.query<ResultSetHeader>(`
            UPDATE playground_query_executions
            SET queue_job_id = ?, queue_initial_rank = ?, queue_current_rank = ?
            WHERE id = UUID_TO_BIN(?)
        `, [queueJobId, queueInitialRank, queueCurrentRank, executionId]);
    }

    async finishQueryExecution(conn: Connection, options: FinishedQueryExecutionDTO):Promise<void> {
        const { id, status, executedAt, finishedAt, spent } = options;
        const executedAtValue = executedAt?.toSQL() || null;
        const finishedAtValue = finishedAt?.toSQL() || null;

        await conn.query<ResultSetHeader>(`
            UPDATE playground_query_executions
            SET status = ?, executed_at = ?, finished_at = ?, spent = ?
            WHERE id = UUID_TO_BIN(?)
        `, [status, executedAtValue, finishedAtValue, spent, id]);
    }

    async cancelPrevQueryExecution(conn: Connection, existedExecutions: QueryExecution[]) {
        for (let execution of existedExecutions) {
            await this.finishQueryExecution(conn, {
                ...execution,
                status: QueryStatus.Cancel,
            });
        }
    }

    async getQueryExecution(conn: Connection, executionId: string): Promise<QueryExecution> {
        const [rows] = await conn.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, user_id AS userId, ip, query_sql AS querySQL, query_hash AS queryHash, query_digest AS queryDigest, 
                status, engines, queue_job_id AS queueJobId, queue_initial_rank AS queueInitialRank, 
                queue_current_rank AS queueCurrentRank, hit_cache AS hitCache, error,
                requested_at AS requestedAt, executed_at AS executedAt, finished_at AS finishedAt, spent
             FROM playground_query_executions
             WHERE id = UUID_TO_BIN(?)
        `, [executionId]);
        if (rows.length === 0) {
            throw new APIError(404, 'Query execution not found.');
        }
        return rows[0];
    }

    toQueryExecutionVO(execution: QueryExecution): QueryExecutionVO {
        return {
            id: execution.id,
            queryHash: execution.queryHash,
            queryDigest: execution.queryDigest,
            status: execution.status,
            engines: execution.engines,
            hitCache: execution.hitCache,
            queueJobId: execution.queueJobId,
            queueInitialRank: execution.queueInitialRank,
            queueCurrentRank: execution.queueCurrentRank,
            error: execution.error,
        };
    }

    async findExistedQueryExecutions(conn: Connection, userId?: number, ip?: string): Promise<QueryExecution[]> {
        if (userId) {
            return await this.findUserExistedQueryExecutions(conn, userId, [QueryStatus.Waiting, QueryStatus.Running]);
        } else if (ip) {
            return await this.findIPExistedQueryExecutions(conn, ip, [QueryStatus.Waiting, QueryStatus.Running]);
        } else {
            return [];
        }
    }

    async findUserExistedQueryExecutions(conn: Connection, userId: number, statuses: QueryStatus[]):Promise<QueryExecution[]> {
        const [executions] = await conn.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, user_id AS userId, ip, query_sql AS querySQL, query_hash AS queryHash, query_digest AS queryDigest, 
                status, engines, queue_job_id AS queueJobId, queue_initial_rank AS queueInitialRank, 
                queue_current_rank AS queueCurrentRank, hit_cache AS hitCache, error,
                requested_at AS requestedAt, executed_at AS executedAt, finished_at AS finishedAt, spent
            FROM playground_query_executions pqe
            WHERE
                pqe.user_id = ?
                AND pqe.status IN (?)
        `, [userId, statuses]);
        return executions
    }

    async findIPExistedQueryExecutions(conn: Connection, ip: string, statuses: QueryStatus[]):Promise<QueryExecution[]> {
        const [executions] = await conn.query<any[]>(`
            SELECT
                BIN_TO_UUID(id) AS id, user_id AS userId, ip, query_sql AS querySQL, query_hash AS queryHash, query_digest AS queryDigest, 
                status, engines, queue_job_id AS queueJobId, queue_initial_rank AS queueInitialRank, 
                queue_current_rank AS queueCurrentRank, hit_cache AS hitCache, error,
                requested_at AS requestedAt, executed_at AS executedAt, finished_at AS finishedAt, spent
            FROM playground_query_executions pqe
            WHERE
                pqe.ip = ?
                AND pqe.status IN (?)
        `, [ip, statuses]);
        return executions;
    }
}