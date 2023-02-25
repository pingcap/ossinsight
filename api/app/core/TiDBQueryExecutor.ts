import consola, { Consola } from "consola";
import { PoolConnection, QueryOptions, Connection, PoolOptions, ResultSetHeader, FieldPacket, OkPacket, RowDataPacket, createPool, Pool } from "mysql2/promise";
import { Counter, Summary } from "prom-client";
import {shadowTidbQueryCounter, tidbQueryCounter, shadowTidbQueryTimer, tidbQueryTimer, waitTidbConnectionTimer, waitShadowTidbConnectionTimer} from "../metrics";
import { decoratePoolConnections } from "../utils/db";

export type Rows = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;
export interface Field<T = any> {
  name: string & keyof T;
  columnType: number;
}
export type Fields<T = any> = Field<T>[];
export type Result = [Rows, Fields];
export type Values = any | any[] | { [param: string]: any };
export type Conn = PoolConnection;

export interface QueryExecutor {
  execute(queryKey: string, sql: string): Promise<Result>
}

export class TiDBQueryExecutor implements QueryExecutor {
  protected connections: Pool;
  protected shadowConnections?: Pool | null;
  protected logger: Consola

  constructor(
    options: PoolOptions,
    readonly enableMetrics: boolean = true,
    shadowOptions: PoolOptions | null,
  ) {
    this.connections = createPool(options)
    this.logger = consola.withTag('tidb-query-executor')
    if (shadowOptions != null) {
      this.shadowConnections = createPool(shadowOptions);
    }
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
      counter.labels({query: queryKey, phase: 'start'}).inc();
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
  };

  async executeWithConn<T extends Rows>(conn: Conn, queryKey: string, sql: string): Promise<[T, Fields]>;
  async executeWithConn<T extends Rows>(conn: Conn, queryKey: string, sql: string, values: Values): Promise<[T, Fields]>;
  async executeWithConn<T extends Rows>(conn: Conn, queryKey: string, options: QueryOptions): Promise<[T, Fields]>;
  async executeWithConn<T extends Rows>(conn: Conn, queryKey: string, sqlOrOptions: string | QueryOptions, values?: Values): Promise<[T, Fields]> {
    this.executeWithConnShadow(queryKey, sqlOrOptions, values);
    return this.executeWithConnInternal(tidbQueryTimer, tidbQueryCounter, conn, queryKey, sqlOrOptions, values);
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
}

export class TiDBPlaygroundQueryExecutor extends TiDBQueryExecutor {

  constructor(options: PoolOptions, connectionLimits: string[], shadowOptions: PoolOptions | null) {
    super(options, /* default value for enableMetrics is true */ true, shadowOptions);
    this.logger = consola.withTag('playground-query-executor')
    decoratePoolConnections(this.connections, { initialSql: connectionLimits })
  }
}