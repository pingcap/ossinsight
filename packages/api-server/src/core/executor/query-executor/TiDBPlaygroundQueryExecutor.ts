import {Connection, Pool, QueryOptions} from "mysql2/promise";
import {Counter, Histogram} from 'prom-client';
import {Fields, Rows, Values} from './QueryExecutor';
import {enforceSQLPolicy} from '../../playground/sql-policy';
import pino from "pino";
import { TiDBQueryExecutor } from "./TiDBQueryExecutor";
import { decoratePoolConnections } from "../../db/pool-decorator";

export class TiDBPlaygroundQueryExecutor extends TiDBQueryExecutor {
  protected readonly logger: pino.Logger = this.pLogger.child({ module: 'tidb-query-executor' });

  // All entry points (including queued jobs, EXPLAIN and shadow execution) pass
  // here. A caller cannot bypass policy by invoking executeWithConn directly.
  async executeWithConnInternal<T extends Rows>(
    timer: Histogram, counter: Counter, conn: Connection,
    queryKey: string, input: string | QueryOptions, values?: Values,
  ): Promise<[T, Fields]> {
    const sql = enforceSQLPolicy(typeof input === 'string' ? input : input.sql);
    const safeInput = typeof input === 'string' ? sql : { ...input, sql };
    return super.executeWithConnInternal(timer, counter, conn, queryKey, safeInput, values);
  }

  constructor(
    pool: Pool,
    shadowPool?: Pool | null,
    pLogger: pino.Logger = pino(),
    connectionLimits: string[] = []
  ) {
    super(pool, shadowPool, pLogger);
    // Keep server parsing consistent with the MySQL parser used for authorization.
    const initialSql = [...connectionLimits, "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'"];
    decoratePoolConnections(this.logger, this.pool, { initialSql });
    if (this.shadowPool) {
      decoratePoolConnections(this.logger, this.shadowPool, { initialSql });
    }
  }
}
