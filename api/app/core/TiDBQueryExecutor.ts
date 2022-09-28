import consola, { Consola } from "consola";
import { PoolConnection, QueryOptions, Connection, PoolOptions, ResultSetHeader, FieldPacket, OkPacket, RowDataPacket, createPool, Pool } from "mysql2/promise";
import {tidbQueryCounter, tidbQueryTimer, waitTidbConnectionTimer} from "../metrics";
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
  protected logger: Consola

  constructor(
    options: PoolOptions,
    readonly enableMetrics: boolean = true
  ) {
    this.connections = createPool(options)
    this.logger = consola.withTag('tidb-query-executor')
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
    let end = () => {};
    if (this.enableMetrics) {
      end = tidbQueryTimer.startTimer();
      tidbQueryCounter.labels({ query: queryKey, phase: 'start' }).inc();
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
        tidbQueryCounter.labels({ query: queryKey, phase: 'success' }).inc();
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
        tidbQueryCounter.labels({ query: queryKey, phase: 'error' }).inc();
      }

      throw err;
    }
  }

  async getConnection(): Promise<PoolConnection> {
    let end = () => {};
    if (this.enableMetrics) {
      end = waitTidbConnectionTimer.startTimer();
    }

    try {
      const conn = await this.connections.getConnection();
      end();
      return conn;
    } catch(err: any) {
      end();
      throw err;
    }
  }

}

export class TiDBPlaygroundQueryExecutor extends TiDBQueryExecutor {

  constructor(options: PoolOptions, connectionLimits: string[]) {
    super(options);
    this.logger = consola.withTag('playground-query-executor')
    decoratePoolConnections(this.connections, { initialSql: connectionLimits })
  }
}
