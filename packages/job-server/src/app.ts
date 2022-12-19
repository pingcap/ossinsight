import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { MySQLPromisePool } from '@fastify/mysql';

import { JobServerEnvSchema } from './env';
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
      REDIS_URL: string,
      PLAYGROUND_DATABASE_URL: string;
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
    schema: JobServerEnvSchema,
  });

  // Load plugins.
  await fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

};

export default app;
export { app, options };
