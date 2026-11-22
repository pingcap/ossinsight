import {Connection, Pool, QueryOptions} from "mysql2/promise";
import {Counter, Histogram} from 'prom-client';
import {Fields, Rows, Values} from './QueryExecutor';
import {enforceSQLPolicy} from '../../playground/sql-policy';
import pino from "pino";
import { TiDBQueryExecutor } from "./TiDBQueryExecutor";
import { decoratePoolConnections } from "../../db/pool-decorator";
import {DEFAULT_PLAYGROUND_QUERY_TIMEOUT, validatePlaygroundQueryTimeout} from '../../playground/limitation';

export class TiDBPlaygroundQueryExecutor extends TiDBQueryExecutor {
  protected readonly logger: pino.Logger = this.pLogger.child({ module: 'tidb-query-executor' });

  // All entry points (including queued jobs, EXPLAIN and shadow execution) pass
  // here. A caller cannot bypass policy by invoking executeWithConn directly.
  async executeWithConnInternal<T extends Rows>(
    timer: Histogram, counter: Counter, conn: Connection,
    queryKey: string, input: string | QueryOptions, values?: Values,
  ): Promise<[T, Fields]> {
    const sql = enforceSQLPolicy(typeof input === 'string' ? input : input.sql);
    const requested = typeof input === 'string' ? undefined : input.timeout;
    const timeout = Number.isSafeInteger(requested) && requested! > 0
      ? Math.min(requested!, this.statementTimeoutMs) : this.statementTimeoutMs;
    const safeInput = {...(typeof input === 'string' ? {values} : input), sql, timeout};
    try {
      // Also enforce the budget for externally supplied/reused connections and
      // smaller per-query budgets. The AST serializer strips caller SQL hints.
      await conn.execute({sql: `SET SESSION max_execution_time = ${timeout}`, timeout: Math.min(timeout, 5000)});
      return await super.executeWithConnInternal<T>(timer, counter, conn, queryKey, safeInput);
    } catch (error: any) {
      if (error?.code === 'PROTOCOL_SEQUENCE_TIMEOUT') conn.destroy();
      throw error;
    }
  }

  constructor(
    pool: Pool,
    shadowPool?: Pool | null,
    pLogger: pino.Logger = pino(),
    connectionLimits: string[] = [],
    readonly statementTimeoutMs = DEFAULT_PLAYGROUND_QUERY_TIMEOUT,
  ) {
    super(pool, shadowPool, pLogger);
    validatePlaygroundQueryTimeout(statementTimeoutMs);
    // Keep server parsing consistent with the MySQL parser used for authorization.
    const initialSql = [...connectionLimits, "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'",
      `SET SESSION max_execution_time = ${statementTimeoutMs}`];
    decoratePoolConnections(this.logger, this.pool, { initialSql });
    if (this.shadowPool) {
      decoratePoolConnections(this.logger, this.shadowPool, { initialSql });
    }
  }
}
