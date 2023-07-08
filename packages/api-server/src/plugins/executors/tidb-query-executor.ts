import {Pool} from "mysql2/promise";
import {pino} from "pino";
import {TiDBQueryExecutor} from "../../core/executor/query-executor/TiDBQueryExecutor";
import fp from "fastify-plugin";

export default fp(async (app) => {
  app.decorate('tidbQueryExecutor', new TiDBQueryExecutor(
    app.mysql as unknown as Pool,
    app.mysql.shadow as unknown as Pool,
    app.log as pino.Logger
  ));
}, {
  name: '@ossinsight/tidb-query-executor',
  dependencies: [
    '@ossinsight/tidb',
  ]
});

declare module 'fastify' {
  interface FastifyInstance {
    tidbQueryExecutor: TiDBQueryExecutor;
  }
}