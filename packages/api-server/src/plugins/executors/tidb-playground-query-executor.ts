import { FastifyJWTOptions } from '@fastify/jwt';
import { FastifyOAuth2Options } from '@fastify/oauth2';
import fp from 'fastify-plugin';
import { TiDBPlaygroundQueryExecutor } from '../../core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import { getPlaygroundSessionLimits } from '../../core/playground/limitation';

export default fp<FastifyOAuth2Options & FastifyJWTOptions>(async (app) => {
  app.decorate('playgroundQueryExecutor', new TiDBPlaygroundQueryExecutor({
    uri: app.config.PLAYGROUND_DATABASE_URL,
  }, getPlaygroundSessionLimits()));
}, {
  name: 'playground-query-executor',
});

declare module 'fastify' {
  interface FastifyInstance {
    playgroundQueryExecutor: TiDBPlaygroundQueryExecutor;
  }
}