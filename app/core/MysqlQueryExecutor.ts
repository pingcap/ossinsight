import {QueryExecutor} from "./Query";
import {createPool, Pool, PoolOptions} from 'mysql2'
import consola, {Consola} from "consola";

export class MysqlQueryExecutor<T> implements QueryExecutor<T> {

  private connections: Pool
  private logger: Consola

  constructor(options: PoolOptions) {
    this.connections = createPool(options)
    this.logger = consola.withTag('mysql')
  }

  async execute(sql: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.connections.getConnection((err, connection) => {
        if (err) {
          reject(err)
          this.logger.error('failed to establish a connection', err)
          return
        }
        this.logger.debug('executing sql by connection<%d>\n %s', connection.threadId, sql)
        connection.query(sql, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows as never)
          }
          connection.release()
        })
      })
    })
  }

}
