import {QueryExecutor} from "./Query";
import {createPool, Pool, PoolConnection, PoolOptions} from 'mysql2'
import consola, {Consola} from "consola";
import {tidbQueryTimer, waitTidbConnectionTimer} from "../metrics";

export class MysqlQueryExecutor<T> implements QueryExecutor<T> {

  private connections: Pool
  private logger: Consola

  constructor(options: PoolOptions) {
    this.connections = createPool(options)
    this.logger = consola.withTag('mysql')
  }

  async execute(sql: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const connection = await this.getConnection();
      this.executeWithConn(sql, connection).then(resolve).catch(reject)
    })
  }

  async executeWithConn(sql: string, connection: PoolConnection): Promise<T> {
    return new Promise((resolve, reject) => {
      this.logger.debug('Executing sql by connection<%d>\n %s', connection.threadId, sql)
      const end = tidbQueryTimer.startTimer()
      connection.query(sql, (err, rows) => {
        end()
        if (err) {
          reject(err)
        } else {
          resolve(rows as never)
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
