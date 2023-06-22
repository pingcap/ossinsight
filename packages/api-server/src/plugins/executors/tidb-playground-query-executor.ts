import fp from 'fastify-plugin';
import {Pool} from "mysql2/promise";
import {pino} from "pino";
import { TiDBPlaygroundQueryExecutor } from '../../core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import { getPlaygroundSessionLimits } from '../../core/playground/limitation';

export default fp(async (app) => {
  // TODO: make playground connection config is optional.
  const playgroundQueryExecutor = new TiDBPlaygroundQueryExecutor(
    app.mysql.playground as unknown as Pool,
    app.mysql.playgroundShadow as unknown as Pool,
    app.log as pino.Logger,
    getPlaygroundSessionLimits()
  );
  app.decorate('playgroundQueryExecutor', playgroundQueryExecutor);
}, {
  name: '@ossinsight/playground-query-executor',
  dependencies: [
    '@ossinsight/tidb',
  ]
});

declare module 'fastify' {
  interface FastifyInstance {
    playgroundQueryExecutor: TiDBPlaygroundQueryExecutor;
  }
}