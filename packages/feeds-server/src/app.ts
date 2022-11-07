import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';

import { DateTime } from 'luxon';
import { EmailServerEnvSchema } from './env';
import { FastifyPluginAsync } from 'fastify';
import { calcRepoMilestonesInConcurrent } from './jobs/calc-repo-milestones';
import fastifyCron from 'fastify-cron';
import fastifyEnv from '@fastify/env';
import fastifyPrismaClient from "fastify-prisma-client";
import { join } from 'path';

export type AppOptions = {
  calcHistoryRepoMilestones: boolean;
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  calcHistoryRepoMilestones: false,
}

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string,
      SEND_REPO_FEEDS_CRON: string,
      CALC_REPO_MILESTONES_CRON: string,
      CALC_REPO_MILESTONES_CONCURRENT: number,
    };
  }
}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  await fastify.register(fastifyEnv, {
    confKey: 'config',      // You can access environment variables via `fastify.config`.
    dotenv: true,
    schema: EmailServerEnvSchema
  });

  await fastify.register(fastifyPrismaClient);

  await fastify.register(fastifyCron);

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'jobs'),
    options: opts,
  });

  if (opts.calcHistoryRepoMilestones) {
    const from = DateTime.fromSQL('2011-01-01');
    const to = DateTime.now();
    const concurrent = fastify.config.CALC_REPO_MILESTONES_CONCURRENT;
    fastify.log.info({
      from, to, concurrent
    }, 'Calc history repository milestones.');
    await calcRepoMilestonesInConcurrent(fastify, concurrent, from, to);
    fastify.close();
  }
};

export default app;
export { app, options }
