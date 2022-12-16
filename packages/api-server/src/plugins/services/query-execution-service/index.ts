import {Connection, ResultSetHeader} from "mysql2/promise";
import {APIError} from "../../../utils/error";
import fp from "fastify-plugin";
import {DateTime} from "luxon";

export interface QueryExecution {
    id: number;
    // Identifier of the query requester.
    userId?: number | null;
    ip?: string | null;
    // The SQL statement.
    sql: string;
    queryHash: string;
    queryDigest: string | null;
    // Execution info.
    enqueue?: boolean;
    useTiFlash: boolean;
    status: QueryStatus;
    fromCache?: boolean;
    // Stats.
    requestedAt: DateTime;
    executedAt?: DateTime | null;
    finishedAt?: DateTime | null;
}

export type CreateQueryExecutionOptions = Pick<QueryExecution, "userId" | "ip" | "queryHash" | "queryDigest" | "sql" | "useTiFlash" | "status" | "requestedAt">;

export type FinishedQueryExecutionOptions = Pick<QueryExecution, "id" | "executedAt" | "finishedAt" | "status">;

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
    name: 'query-execution-service',
    dependencies: [
        '@fastify/env'
    ]
});

export class QueryExecutionService {

    async createQueryExecution(conn: Connection, options: CreateQueryExecutionOptions):Promise<QueryExecution> {
        const { userId = 0, ip = 'N/A', queryHash, queryDigest, sql, useTiFlash, status, requestedAt = DateTime.now() } = options;
        const [rs] = await conn.query<ResultSetHeader>(`
            INSERT INTO playground_query_executions(user_id, ip, query_hash, query_digest, \`sql\`, use_tiflash, status, requested_at)
            VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?
            )
        `, [userId, ip, queryHash, queryDigest, sql, useTiFlash, status, requestedAt.toSQL()]);
        return {
            id: rs.insertId,
            ...options
        };
    }

    async finishQueryExecution(conn: Connection, options: FinishedQueryExecutionOptions):Promise<void> {
        const { id, status, executedAt, finishedAt } = options;
        const executedAtValue = executedAt?.toSQL() || null;
        const finishedAtValue = finishedAt?.toSQL() || null;

        await conn.query<ResultSetHeader>(`
            UPDATE playground_query_executions
            SET status = ?, executed_at = ?, finished_at = ?
            WHERE id = ?
        `, [status, executedAtValue, finishedAtValue, id]);
    }

    async cancelPrevQueryExecution(conn: Connection, existedExecutions: QueryExecution[]) {
        for (let execution of existedExecutions) {
            await this.finishQueryExecution(conn, {
                ...execution,
                status: QueryStatus.Cancel,
            });
        }
    }

    async getQueryExecution(conn: Connection, executionId: number): Promise<QueryExecution> {
        const [rows] = await conn.query<any[]>(`
            SELECT
                id, user_id AS userId, ip, query_hash AS queryHash, query_digest AS queryDigest, \`sql\`, 
                use_tiflash AS useTiFlash, status, requested_at AS requestedAt, executed_at AS executedAt,
                finished_at AS finishedAt
             FROM playground_query_executions
             WHERE id = ?
        `, [executionId]);
        if (rows.length === 0) {
            throw new APIError(404, 'Query execution not found.');
        }
        return rows[0];
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
                id, user_id AS userId, ip, query_hash AS queryHash, query_digest AS queryDigest, \`sql\`, 
                use_tiflash AS useTiFlash, status, requested_at AS requestedAt, executed_at AS executedAt,
                finished_at AS finishedAt
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
                id, user_id AS userId, ip, query_hash AS queryHash, query_digest AS queryDigest, \`sql\`, 
                use_tiflash AS useTiFlash, status, requested_at AS requestedAt, executed_at AS executedAt,
                finished_at AS finishedAt
            FROM playground_query_executions pqe
            WHERE
                pqe.ip = ?
                AND pqe.status IN (?)
        `, [ip, statuses]);
        return executions;
    }
}