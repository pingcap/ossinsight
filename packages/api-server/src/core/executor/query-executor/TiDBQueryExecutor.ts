import { Conn, Fields, QueryExecutor, Rows, Values } from "./QueryExecutor";
import { Connection, Pool, PoolConnection, PoolOptions, QueryOptions } from "mysql2/promise";
import {shadowTidbQueryCounter, shadowTidbQueryTimer, tidbQueryCounter, tidbQueryTimer, waitShadowTidbConnectionTimer, waitTidbConnectionTimer} from "../../../plugins/metrics";
import {getPool} from "../../db/new";
import { Counter, Summary } from "prom-client";

export class TiDBQueryExecutor implements QueryExecutor {
  protected connections: Pool;
  protected shadowConnections: Pool | null;

  constructor(
    options: PoolOptions,
    readonly enableMetrics: boolean = true,
    shadowOptions: PoolOptions | null,
  ) {
    this.connections = getPool(options)
    this.shadowConnections = shadowOptions ? getPool(shadowOptions) : null;
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
    this.executeWithConnShadow(queryKey, sqlOrOptions, values);
    return this.executeWithConnInternal(tidbQueryTimer, tidbQueryCounter, conn, queryKey, sqlOrOptions, values);
  }

  async executeWithConnShadow(queryKey: string, sqlOrOptions: string | QueryOptions, values?: Values) {
    if (this.shadowConnections == null) {
      return;
    }
    this.executeWithConnInternal(shadowTidbQueryTimer, shadowTidbQueryCounter,
      await this.getConnectionInternal(this.shadowConnections, waitShadowTidbConnectionTimer),
      queryKey, sqlOrOptions, values);
  }

  async executeWithConnInternal<T extends Rows>(timer: Summary, counter: Counter, conn: Connection,
    queryKey: string, sqlOrOptions: string | QueryOptions, values?: Values): Promise<[T, Fields]> {
    let end = () => {};
    if (this.enableMetrics) {
      end = timer.startTimer();
      counter.labels({ query: queryKey, phase: 'start' }).inc();
    }

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

      end();
      if (this.enableMetrics) {
        counter.labels({ query: queryKey, phase: 'success' }).inc();
      }

      return [
        rows,
        fields.map((field) => {
          return {
            name: field.name,
            columnType: field.type
          }
        })
      ];
    } catch (err) {
      end();
      if (this.enableMetrics) {
        counter.labels({ query: queryKey, phase: 'error' }).inc();
      }

      throw err;
    }
  }

  async getConnectionInternal(pool: Pool, timer: Summary): Promise<PoolConnection> {
    let end = () => {};
    if (this.enableMetrics) {
      end = timer.startTimer();
    }

    try {
      const conn = await pool.getConnection();
      end();
      return conn;
    } catch(err: any) {
      end();
      throw err;
    }
  }

  async getConnection(): Promise<PoolConnection> {
    return this.getConnectionInternal(this.connections, waitTidbConnectionTimer);
  }

  async destroy () {
    await this.connections.end()
  }

}
