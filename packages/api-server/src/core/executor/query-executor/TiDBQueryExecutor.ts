import {Connection, Pool, PoolConnection, QueryOptions, RowDataPacket} from "mysql2/promise";
import pino from "pino";
import {Counter, Histogram} from "prom-client";
import {
  shadowTidbQueryCounter,
  shadowTidbQueryHistogram,
  tidbQueryCounter,
  tidbQueryHistogram,
  shadowTidbWaitConnectionHistogram,
  tidbWaitConnectionHistogram
} from "../../../metrics";
import {Conn, Fields, QueryExecutor, Rows, Values} from "./QueryExecutor";

export interface NamedQueryOptions extends QueryOptions {enforceStatementTimeout: true; timeout: number}

export class TiDBQueryExecutor implements QueryExecutor {
  protected readonly logger: pino.Logger = this.pLogger.child({ module: 'tidb-query-executor' });

  constructor(
    readonly pool: Pool,
    readonly shadowPool?: Pool | null,
    readonly pLogger: pino.Logger = pino()
  ) {
  }

  async execute<T extends Rows>(queryKey: string, sql: string): Promise<[T, Fields]>;
  async execute<T extends Rows>(queryKey: string, sql: string, values: Values): Promise<[T, Fields]>;
  async execute<T extends Rows>(queryKey: string, options: QueryOptions): Promise<[T, Fields]>;
  async execute<T extends Rows>(queryKey: string, sqlOrOptions: string | QueryOptions, values?: Values): Promise<[T, Fields]> {
    const conn = await this.getConnection();

    try {
      if (typeof sqlOrOptions === 'string') {
        return await this.executeWithConn(conn, queryKey, sqlOrOptions, values);
      } else {
        return await this.executeWithConn(conn, queryKey, sqlOrOptions);
      }
    } finally {
      conn.release();
    }
  }

  async executeWithConn<T extends Rows>(conn: Conn, queryKey: string, sql: string): Promise<[T, Fields]>;
  async executeWithConn<T extends Rows>(conn: Conn, queryKey: string, sql: string, values: Values): Promise<[T, Fields]>;
  async executeWithConn<T extends Rows>(conn: Conn, queryKey: string, options: QueryOptions): Promise<[T, Fields]>;
  async executeWithConn<T extends Rows>(conn: Conn, queryKey: string, sqlOrOptions: string | QueryOptions, values?: Values): Promise<[T, Fields]> {
    this.executeWithConnShadow(queryKey, sqlOrOptions, values).then(null).catch((err) => {
      this.logger.error(err, 'Failed to execute query with shadow conn.');
    });

    return this.executeWithConnInternal(tidbQueryHistogram, tidbQueryCounter, conn, queryKey, sqlOrOptions, values);
  }

  async executeWithConnShadow(queryKey: string, sqlOrOptions: string | QueryOptions, values?: Values) {
    if (!this.shadowPool) {
      return;
    }

    const conn = await this.getConnectionInternal(this.shadowPool, shadowTidbWaitConnectionHistogram);
    try {
      await this.executeWithConnInternal(shadowTidbQueryHistogram, shadowTidbQueryCounter, conn, queryKey, sqlOrOptions, values);
    } finally {
      await conn.release();
    }
  }

  async executeWithConnInternal<T extends Rows>(
    timer: Histogram, counter: Counter, conn: Connection,
    queryKey: string, sqlOrOptions: string | QueryOptions, values?: Values
  ): Promise<[T, Fields]> {
    if (typeof sqlOrOptions === 'object' && 'enforceStatementTimeout' in sqlOrOptions) {
      const {enforceStatementTimeout, ...options} = sqlOrOptions as NamedQueryOptions;
      if (!Number.isSafeInteger(options.timeout) || options.timeout <= 0) throw new Error('Invalid named query deadline.');
      const setupTimeout = Math.min(options.timeout, 5000);
      try {
        const [rows] = await conn.query<RowDataPacket[]>({sql: 'SELECT @@SESSION.max_execution_time AS previous', timeout: setupTimeout});
        const previous = Number(rows[0].previous);
        if (!Number.isSafeInteger(previous) || previous < 0) throw new Error('Invalid TiDB session deadline.');
        const timeout = previous ? Math.min(previous, options.timeout) : options.timeout;
        if (previous !== timeout) await conn.query({sql: `SET SESSION max_execution_time = ${timeout}`, timeout: setupTimeout});
        const result = await this.executeStatement<T>(timer, counter, conn, queryKey, {...options, timeout}, values);
        if (previous !== timeout) await conn.query({sql: `SET SESSION max_execution_time = ${previous}`, timeout: setupTimeout});
        return result;
      } catch (error) {
        // A timed-out statement or a partially restored session cannot rejoin the pool.
        conn.destroy();
        throw error;
      }
    }
    return this.executeStatement<T>(timer, counter, conn, queryKey, sqlOrOptions, values);
  }

  private async executeStatement<T extends Rows>(
    timer: Histogram, counter: Counter, conn: Connection,
    queryKey: string, sqlOrOptions: string | QueryOptions, values?: Values
  ): Promise<[T, Fields]> {
    const end = timer.startTimer({ query: queryKey });
    counter.labels({ query: queryKey, phase: 'start' }).inc();

    if (queryKey.startsWith('explain:')) {
      if (typeof sqlOrOptions === 'string') {
        sqlOrOptions = `EXPLAIN ${sqlOrOptions}`;
      } else {
        sqlOrOptions = {...sqlOrOptions, sql: `EXPLAIN ${sqlOrOptions.sql}`};
      }
    }

    try {
      let rows, fields;
      if (typeof sqlOrOptions === 'string') {
        [rows, fields] = await conn.execute<T>(sqlOrOptions, values);
      } else {
        [rows, fields] = await conn.execute<T>(sqlOrOptions);
      }

      counter.labels({ query: queryKey, phase: 'success' }).inc();

      return [
        rows,
        fields.map((field: any) => {
          return {
            name: field.name,
            columnType: field.columnType
          }
        })
      ];
    } catch (err) {
      counter.labels({ query: queryKey, phase: 'error' }).inc();
      throw err;
    } finally {
      end();
    }
  }

  async getConnectionInternal(pool: Pool, timer: Histogram): Promise<PoolConnection> {
    const end = timer.startTimer();

    try {
      return await pool.getConnection();
    } finally {
      end();
    }
  }

  async getConnection(): Promise<PoolConnection> {
    return await this.getConnectionInternal(this.pool, tidbWaitConnectionHistogram);
  }

  async getShadowConnection(): Promise<PoolConnection> {
    if (!this.shadowPool) {
      throw new Error('No shadow connection pool provided.');
    }
    return await this.getConnectionInternal(this.shadowPool, shadowTidbWaitConnectionHistogram);
  }

}
