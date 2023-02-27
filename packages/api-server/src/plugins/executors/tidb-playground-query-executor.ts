import fp from 'fastify-plugin';
import { TiDBPlaygroundQueryExecutor } from '../../core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import { getPlaygroundSessionLimits } from '../../core/playground/limitation';

export default fp(async (app) => {
  const poolOptions = {
    uri: app.config.DATABASE_URL
  };
  const shadowPoolOptions = app.config.SHADOW_DATABASE_URL ? {
    uri: app.config.SHADOW_DATABASE_URL
  } : null;
  app.decorate('playgroundQueryExecutor', new TiDBPlaygroundQueryExecutor(poolOptions, shadowPoolOptions, getPlaygroundSessionLimits()));
}, {
  name: 'playground-query-executor',
});

declare module 'fastify' {
  interface FastifyInstance {
    playgroundQueryExecutor: TiDBPlaygroundQueryExecutor;
  }
}