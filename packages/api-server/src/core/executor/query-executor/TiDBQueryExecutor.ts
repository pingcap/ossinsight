import { Conn, Fields, QueryExecutor, Rows, Values } from "./QueryExecutor";
import { Connection, Pool, PoolConnection, PoolOptions, QueryOptions } from "mysql2/promise";
import {shadowTidbQueryCounter, shadowTidbQueryTimer, tidbQueryCounter, tidbQueryTimer, waitShadowTidbConnectionTimer, waitTidbConnectionTimer} from "../../../plugins/metrics";
import {getPool} from "../../db/new";
import { Counter, Summary } from "prom-client";
import pino from "pino";

export class TiDBQueryExecutor implements QueryExecutor {
  protected connections: Pool;
  protected shadowConnections?: Pool | null;
  public readonly shadow: boolean = false;
  protected logger = pino().child({ component: 'tidb-query-executor' });

  constructor(
    options: PoolOptions,
    shadowOptions?: PoolOptions | null,
    readonly enableMetrics: boolean = true,
  ) {
    this.connections = getPool(options)
    this.shadowConnections = shadowOptions ? getPool(shadowOptions) : null;
    this.shadow = !!shadowOptions;
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

    return this.executeWithConnInternal(tidbQueryTimer, tidbQueryCounter, conn, queryKey, sqlOrOptions, values);
  }

  async executeWithConnShadow(queryKey: string, sqlOrOptions: string | QueryOptions, values?: Values) {
    if (!this.shadowConnections) {
      return;
    }
    const conn = await this.getConnectionInternal(this.shadowConnections, waitShadowTidbConnectionTimer);
    try {
      await this.executeWithConnInternal(shadowTidbQueryTimer, shadowTidbQueryCounter, conn, queryKey, sqlOrOptions, values);
    } finally {
      await conn.release();
    }
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

  async getShadowConnection(): Promise<PoolConnection> {
    if (!this.shadowConnections) {
      throw new Error('No shadow connections provided.');
    }
    return this.getConnectionInternal(this.shadowConnections, waitShadowTidbConnectionTimer);
  }

  async destroy () {
    await this.connections.end()
  }

}
