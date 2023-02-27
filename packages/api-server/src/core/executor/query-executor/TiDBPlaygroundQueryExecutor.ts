import { PoolOptions } from "mysql2/promise";
import { TiDBQueryExecutor } from "./TiDBQueryExecutor";
import { decoratePoolConnections } from "../../db/pool-decorator";

export class TiDBPlaygroundQueryExecutor extends TiDBQueryExecutor {
  constructor(options: PoolOptions, shadowOptions?: PoolOptions | null, connectionLimits: string[] = []) {
    super(options, shadowOptions, true);
    decoratePoolConnections(this.connections, { initialSql: connectionLimits });
    if (this.shadowConnections) {
      decoratePoolConnections(this.shadowConnections, { initialSql: connectionLimits });
    }
  }
}