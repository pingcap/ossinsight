import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import fastifyMySQL, { MySQLPromisePool } from '@fastify/mysql';

import { EmailServerEnvSchema } from './env';
import { FastifyPluginAsync } from 'fastify';
import fastifyEnv from '@fastify/env';
import { join } from 'path';

export type AppOptions = {
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
};

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
    };
    mysql: MySQLPromisePool;
  }
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts,
): Promise<void> => {
  await fastify.register(fastifyEnv, {
    confKey: 'config', // You can access environment variables via `fastify.config`.
    dotenv: true,
    schema: EmailServerEnvSchema,
  });

  // Init MySQL Client.
  await fastify
    .register(fastifyMySQL, {
      promise: true,
    })
    .ready(async () => {
      try {
        await fastify.mysql.pool.query('SELECT 1');
        fastify.log.info('Connected to MySQL/TiDB database.');
      } catch (err) {
        fastify.log.error(err, 'Failed to connect to MySQL/TiDB database.');
      }
    });

  // Load API routes.
  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    routeParams: true,
    options: opts,
  });
};

export default app;
export { app, options };
