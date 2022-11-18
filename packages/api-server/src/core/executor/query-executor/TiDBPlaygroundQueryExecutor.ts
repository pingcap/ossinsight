import { PoolOptions } from "mysql2/promise";
import { TiDBQueryExecutor } from "./TiDBQueryExecutor";
import { decoratePoolConnections } from "../../../utils/db";

export class TiDBPlaygroundQueryExecutor extends TiDBQueryExecutor {

    constructor(options: PoolOptions, connectionLimits: string[]) {
      super(options);
      decoratePoolConnections(this.connections, { initialSql: connectionLimits });
    }

}
  