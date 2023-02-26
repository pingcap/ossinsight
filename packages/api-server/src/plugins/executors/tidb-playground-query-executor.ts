import fp from 'fastify-plugin';
import { TiDBPlaygroundQueryExecutor } from '../../core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import { getPlaygroundSessionLimits } from '../../core/playground/limitation';

export default fp(async (app) => {
  app.decorate('playgroundQueryExecutor', new TiDBPlaygroundQueryExecutor({
    uri: app.config.PLAYGROUND_DATABASE_URL,
  }, getPlaygroundSessionLimits(), !!app.config.SHADOW_PLAYGROUND_DATABASE_URL ? {
    uri: app.config.SHADOW_PLAYGROUND_DATABASE_URL,
  } : null));
}, {
  name: 'playground-query-executor',
});

declare module 'fastify' {
  interface FastifyInstance {
    playgroundQueryExecutor: TiDBPlaygroundQueryExecutor;
  }
}