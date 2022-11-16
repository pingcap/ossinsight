import { FastifyJWTOptions } from '@fastify/jwt';
import { FastifyOAuth2Options } from '@fastify/oauth2';
import fp from 'fastify-plugin';
import { getConnectionOptions } from '../../utils/db';
import { TiDBPlaygroundQueryExecutor } from '../../core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import { getPlaygroundSessionLimits } from '../../core/playground/playground';

export default fp<FastifyOAuth2Options & FastifyJWTOptions>(async (fastify) => {
  fastify.decorate('playgroundQueryExecutor', new TiDBPlaygroundQueryExecutor(getConnectionOptions({
    connectionLimit: fastify.config.WEB_SHELL_CONNECTION_LIMITS,
    queueLimit: fastify.config.WEB_SHELL_QUEUE_LIMIT,
    user: fastify.config.WEB_SHELL_USER,
    password: fastify.config.WEB_SHELL_PASSWORD,
  }), getPlaygroundSessionLimits()));
}, {
  name: 'playground-query-executor',
});

declare module 'fastify' {
  interface FastifyInstance {
    playgroundQueryExecutor: TiDBPlaygroundQueryExecutor;
  }
}