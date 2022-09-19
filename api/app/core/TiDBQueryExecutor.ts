import {createPool, OkPacket, Pool, PoolConnection, PoolOptions, ResultSetHeader, RowDataPacket} from 'mysql2'
import consola, {Consola} from "consola";
import {tidbQueryTimer, waitTidbConnectionTimer} from "../metrics";
import Connection from 'mysql2/typings/mysql/lib/Connection';

export interface Result {
  fields: FieldMeta[];
  rows: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;
}

export interface FieldMeta {
    name: string;
    columnType: number;
}

export interface QueryExecutor {
  execute (sql: string): Promise<Result>
}

export class TiDBQueryExecutor implements QueryExecutor {

  protected connections: Pool
  protected logger: Consola

  constructor(options: PoolOptions) {
    this.connections = createPool(options)
    this.logger = consola.withTag('mysql')
  }

  async execute(sql: string, values: any[] = []): Promise<Result> {
    const connection = await this.getConnection();
    
    try {
      return this.executeWithConn(connection, sql, values);
    } finally {
      connection.release();
    }
  }

  async executeWithConn(connection: Connection, sql: string, values: any[] = []): Promise<Result> {
    return new Promise((resolve, reject) => {
      this.logger.debug('Executing sql by connection<%d>\n %s', connection.threadId, sql);

      const end = tidbQueryTimer.startTimer()
      connection.query(sql, values, (err, rows, fields) => {
        end()

        // FIXME: the type of `fields` in the callback function's definition is wrong.
        const fieldDefs: FieldMeta[] = (fields || []).map((field: any) => {
          return {
            name: field.name,
            columnType: field.columnType
          }
        });

        if (err) {
          reject(err)
        } else {
          resolve({
            fields: fieldDefs,
            rows: rows,
          })
        }
      })
    });
  }

  async getConnection(): Promise<PoolConnection> {
    return new Promise((resolve, reject) => {
      const end = waitTidbConnectionTimer.startTimer()
      this.connections.getConnection((err, connection) => {
        end()
        if (err) {
          this.logger.error('Failed to establish a connection', err)
          reject(err)
        }
        resolve(connection);
      });
    });
  }

}

export class TiDBPlaygroundQueryExecutor extends TiDBQueryExecutor {
  constructor(options: PoolOptions) {
    super(options);
  }

  async executeWithConn(
    connection: PoolConnection,
    sql: string,
    limit: boolean = false
  ): Promise<Result> {
    return new Promise((resolve, reject) => {
      this.logger.debug(
        "Executing sql by connection<%d>\n %s",
        connection.threadId,
        sql
      );

      let queryOption: QueryOptions = {
        sql: sql,
      };

      const limitCmdList = [
        `SET SESSION tidb_isolation_read_engines="tikv,tidb";`,
        `SET SESSION tidb_mem_quota_query=8 << 23;`,
        `SET SESSION tidb_enable_rate_limit_action = false;`,
        `SET SESSION tidb_enable_paging=true;`,
        `SET SESSION tidb_executor_concurrency=1;`,
        `SET SESSION tidb_distsql_scan_concurrency=5;`,
      ];

      if (limit) {
        limitCmdList.forEach((cmd) => {
          connection.query(cmd, (err, rows, fields) => {
            if (err) {
              this.logger.warn(`Failed to enable query limit: ${cmd}`, err);
            }
          });
        });
        queryOption.timeout = 120000;
      }

      const end = tidbQueryTimer.startTimer();
      connection.query(queryOption, (err, rows, fields) => {
        end();

        // FIXME: the type of `fields` in the callback function's definition is wrong.
        const fieldDefs: FieldMeta[] = (fields || []).map((field: any) => {
          return {
            name: field.name,
            columnType: field.columnType,
          };
        });

        if (err) {
          reject(err);
        } else {
          resolve({
            fields: fieldDefs,
            rows: rows,
          });
        }
      });
    });
  }
}
