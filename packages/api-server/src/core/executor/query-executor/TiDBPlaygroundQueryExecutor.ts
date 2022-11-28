import { PoolOptions } from "mysql2/promise";
import { TiDBQueryExecutor } from "./TiDBQueryExecutor";
import { decoratePoolConnections } from "../../db/pool-decorator";

export class TiDBPlaygroundQueryExecutor extends TiDBQueryExecutor {

    constructor(options: PoolOptions, connectionLimits: string[]) {
      super(options);
      decoratePoolConnections(this.connections, { initialSql: connectionLimits });
    }

}
  