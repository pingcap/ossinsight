import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { MySQLPromisePool } from '@fastify/mysql';

import { JobServerEnvSchema } from './env';
import { FastifyPluginAsync } from 'fastify';
import fastifyEnv from '@fastify/env';
import { join } from 'path';
import {BullMQAdapter, createBullBoard, FastifyAdapter} from "@bull-board/fastify";
import {Queue, Worker} from "bullmq";
import {QueryExecution} from "@ossinsight/api-server";
import {GitHubRepoWithEvents} from "./types";
import {CalcMilestonesJobInput} from "./jobs/calc_milestones/index.worker";
import {EmailClient} from "./lib/email";

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
      EMAIL_SERVER_URL: string,
      PLAYGROUND_DATABASE_URL: string;
      SEND_REPO_FEEDS_CRON: string,
      CALC_REPO_MILESTONES_CRON: string,
    };
    mysql: MySQLPromisePool;
    emailClient: EmailClient;
    queues: {
      playground: Queue<QueryExecution, any, string>;
      calc_milestones: Queue<CalcMilestonesJobInput, any, string>;
      calc_milestones_for_repo_events: Queue<GitHubRepoWithEvents, any, string>;
      send_feeds_emails: Queue<{}, any, string>;
      send_feeds_email: Queue<{}, any, string>;
    };
    workers: {
      playground: Worker<QueryExecution, any, string>;
      calc_milestones: Worker<CalcMilestonesJobInput, any, string>;
      send_feeds_emails: Worker<{}, any, string>;
      send_feeds_email: Worker<{}, any, string>;
    };
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

  // Register bull-board.
  const serverAdapter = new FastifyAdapter();
  createBullBoard({
    queues: [
      new BullMQAdapter(fastify.queues.playground),
      new BullMQAdapter(fastify.queues.calc_milestones),
      new BullMQAdapter(fastify.queues.calc_milestones_for_repo_events),
      new BullMQAdapter(fastify.queues.send_feeds_emails),
      new BullMQAdapter(fastify.queues.send_feeds_email),
    ],
    serverAdapter,
  });
  fastify.register(serverAdapter.registerPlugin());

  // Trigger the cron jobs.
  fastify.queues.calc_milestones.add("calc_milestones", {}, {
    repeat: {
        pattern: fastify.config.CALC_REPO_MILESTONES_CRON,
    }
  });
};

export default app;
export { app, options };
