import {createPool, FieldPacket, OkPacket, Pool, PoolConnection, PoolOptions, ResultSetHeader, RowDataPacket} from 'mysql2'
import consola, {Consola} from "consola";
import {tidbQueryTimer, waitTidbConnectionTimer} from "../metrics";

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

export class MysqlQueryExecutor implements QueryExecutor {

  private connections: Pool
  private logger: Consola

  constructor(options: PoolOptions) {
    this.connections = createPool(options)
    this.logger = consola.withTag('mysql')
  }

  async execute(sql: string): Promise<Result> {
    const connection = await this.getConnection();

    try {
      return this.executeWithConn(sql, connection)
    } finally {
      connection.release()
    }
  }

  async executeWithConn(sql: string, connection: PoolConnection): Promise<Result> {
    return new Promise((resolve, reject) => {
      this.logger.debug('Executing sql by connection<%d>\n %s', connection.threadId, sql)
      const end = tidbQueryTimer.startTimer()
      connection.query(sql, (err, rows, fields) => {
        end()

        // FIXME: the type of `fields` in the callback function's definition is wrong.
        const fieldDefs: FieldMeta[] = fields.map((field: any) => {
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
