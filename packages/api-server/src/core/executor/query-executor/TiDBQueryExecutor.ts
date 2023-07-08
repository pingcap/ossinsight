import {Connection, Pool, PoolConnection, QueryOptions} from "mysql2/promise";
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
        return this.executeWithConn(conn, queryKey, sqlOrOptions, values);
      } else {
        return this.executeWithConn(conn, queryKey, sqlOrOptions);
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
    const end = timer.startTimer({ query: queryKey });
    counter.labels({ query: queryKey, phase: 'start' }).inc();

    if (queryKey.startsWith('explain:')) {
      if (typeof sqlOrOptions === 'string') {
        sqlOrOptions = `EXPLAIN ${sqlOrOptions}`;
      } else {
        sqlOrOptions.sql = `EXPLAIN ${sqlOrOptions.sql}`;
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
