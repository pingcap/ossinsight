import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { JobServerEnvSchema } from './env';
import { FastifyPluginAsync } from 'fastify';
import fastifyEnv from '@fastify/env';
import { join } from 'path';
import {Queue, Worker} from "bullmq";
import { Question,} from "@ossinsight/api-server";

// Notice: to hide the MaxListenersExceededWarning, we need to set the max listeners to a larger number.
require('events').EventEmitter.prototype._maxListeners = 20;

export type AppOptions = {
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
};

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      CONFIGS_PATH: string;
      DATABASE_URL: string;
      REDIS_URL: string,
      EMAIL_SERVER_URL: string,
      PLAYGROUND_DATABASE_URL: string;
      PLAYGROUND_SHADOW_DATABASE_URL: string;
      EXPLORER_HIGH_QUEUE_CONCURRENT: number;
      EXPLORER_LOW_QUEUE_CONCURRENT: number;
      EXPLORER_QUERY_SQL_TIMEOUT: number;
      SEND_REPO_FEEDS_CRON: string,
      CALC_REPO_MILESTONES_CRON: string,
      OPENAI_API_KEY: string;
    };
    queues: {
      explorer_high_concurrent_queue: Queue<Question, any, string>;
      explorer_low_concurrent_queue: Queue<Question, any, string>;
    };
    workers: {
      explorer_high_concurrent_queue: Worker<Question, any, string>;
      explorer_low_concurrent_queue: Worker<Question, any, string>;
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

  // Load routes.
  await fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });
};

export default app;
export { app, options };
