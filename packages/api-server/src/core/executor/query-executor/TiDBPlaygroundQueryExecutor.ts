import { PoolOptions } from "mysql2/promise";
import { TiDBQueryExecutor } from "./TiDBQueryExecutor";
import { decoratePoolConnections } from "../../db/pool-decorator";

export class TiDBPlaygroundQueryExecutor extends TiDBQueryExecutor {

    constructor(options: PoolOptions, connectionLimits: string[], shadowOptions: PoolOptions | null) {
      super(options, /* default value for enableMetrics is true */ true, shadowOptions);
      decoratePoolConnections(this.connections, { initialSql: connectionLimits });
      if (this.shadowConnections != null) {
        decoratePoolConnections(this.shadowConnections, { initialSql: connectionLimits });
      }
    }
}