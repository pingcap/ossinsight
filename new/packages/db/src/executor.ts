import { Pool, PoolConnection, RowDataPacket, FieldPacket, QueryOptions } from 'mysql2/promise';
import pino from 'pino';

export type Rows = RowDataPacket[];
export type Fields = FieldPacket[];
export type Values = unknown[];

export interface QueryExecutor {
  execute<T extends Rows>(queryKey: string, sql: string, values?: Values): Promise<[T, Fields]>;
  getConnection(): Promise<PoolConnection>;
}

export class TiDBQueryExecutor implements QueryExecutor {
  private readonly logger: pino.Logger;

  constructor(
    private readonly pool: Pool,
    private readonly shadowPool?: Pool | null,
    parentLogger?: pino.Logger,
  ) {
    this.logger = (parentLogger || pino()).child({ module: 'tidb-executor' });
  }

  async execute<T extends Rows>(
    queryKey: string,
    sql: string,
    values?: Values,
  ): Promise<[T, Fields]> {
    const start = Date.now();
    try {
      const [rows, fields] = values
        ? await this.pool.execute<T>(sql, values)
        : await this.pool.execute<T>(sql);

      const duration = Date.now() - start;
      this.logger.debug({ queryKey, duration }, 'Query executed');

      // Execute on shadow pool for comparison (fire-and-forget)
      if (this.shadowPool) {
        this.executeShadow(queryKey, sql, values).catch(() => {});
      }

      return [rows, fields];
    } catch (error) {
      const duration = Date.now() - start;
      this.logger.error({ queryKey, duration, error }, 'Query failed');
      throw error;
    }
  }

  private async executeShadow(
    queryKey: string,
    sql: string,
    values?: Values,
  ): Promise<void> {
    const start = Date.now();
    try {
      if (values) {
        await this.shadowPool!.execute(sql, values);
      } else {
        await this.shadowPool!.execute(sql);
      }
      this.logger.debug({ queryKey, duration: Date.now() - start }, 'Shadow query executed');
    } catch (error) {
      this.logger.warn({ queryKey, error }, 'Shadow query failed');
    }
  }

  async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
  }
}
