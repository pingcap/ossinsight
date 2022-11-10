import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import fastifyMySQL, { MySQLPromisePool } from '@fastify/mysql';

import { EmailServerEnvSchema } from './env';
import { FastifyPluginAsync } from 'fastify';
import { JobName } from './types';
import fastifyCron from 'fastify-cron';
import fastifyEnv from '@fastify/env';
import { join } from 'path';

export type AppOptions = {
  calcHistoryRepoMilestones: boolean;
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  calcHistoryRepoMilestones: false,
};

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
      SEND_REPO_FEEDS_CRON: string;
      CALC_REPO_MILESTONES_CRON: string;
      MAX_CONCURRENT: number;
    };
    mysql: MySQLPromisePool;
    jobParameters: Map<JobName, Record<string, any>>;
    jobStatuses: Map<JobName, Record<string, any>>;
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
      connectionString: fastify.config.DATABASE_URL,
      connectionLimit: fastify.config.MAX_CONCURRENT,
    })
    .ready(async () => {
      try {
        await fastify.mysql.pool.query('SELECT 1');
        fastify.log.info('Connected to MySQL/TiDB database.');
      } catch (err) {
        fastify.log.error(err, 'Failed to connect to MySQL/TiDB database.');
      }
    });

  // Load jobs.
  await fastify.register(fastifyCron);
  await fastify.decorate(
    'jobParameters',
    new Map<JobName, Record<string, any>>(),
  );
  await fastify.decorate(
    'jobStatuses',
    new Map<JobName, Record<string, any>>(),
  );
  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'jobs'),
    options: opts,
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
