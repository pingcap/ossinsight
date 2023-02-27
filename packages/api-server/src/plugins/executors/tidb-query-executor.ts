import {TiDBQueryExecutor} from "../../core/executor/query-executor/TiDBQueryExecutor";
import fp from "fastify-plugin";

export default fp(async (app) => {
  const poolOptions = {
    uri: app.config.DATABASE_URL
  };
  const shadowPoolOptions = app.config.SHADOW_DATABASE_URL ? {
    uri: app.config.SHADOW_DATABASE_URL
  } : null;
  app.decorate('tidbQueryExecutor', new TiDBQueryExecutor(poolOptions, shadowPoolOptions, true));
}, {
  name: 'tidb-query-executor'
});

declare module 'fastify' {
  interface FastifyInstance {
    tidbQueryExecutor: TiDBQueryExecutor;
  }
}