import {Pool} from "mysql2/promise";
import {pino} from "pino";
import { TiDBQueryExecutor } from "./TiDBQueryExecutor";
import { decoratePoolConnections } from "../../db/pool-decorator";

export class TiDBPlaygroundQueryExecutor extends TiDBQueryExecutor {
  protected readonly logger: pino.Logger = this.pLogger.child({ module: 'tidb-query-executor' });

  constructor(
    pool: Pool,
    shadowPool?: Pool | null,
    pLogger: pino.Logger = pino(),
    connectionLimits: string[] = []
  ) {
    super(pool, shadowPool, pLogger);
    decoratePoolConnections(this.logger, this.pool, { initialSql: connectionLimits });
    if (this.shadowPool) {
      decoratePoolConnections(this.logger, this.shadowPool,  { initialSql: connectionLimits });
    }
  }
}