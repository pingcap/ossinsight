import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, RawServerDefault } from 'fastify';
import { APIServerEnvSchema } from './env';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import fastifyEnv from '@fastify/env';
import { join } from 'path';
import {isProdDatabaseURL} from "./utils/db";
import {APIError} from "./utils/error";

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

export interface AppConfig {
  CONFIGS_PATH: string;
  ADMIN_EMAIL: string;
  DATABASE_URL: string;
  SHADOW_DATABASE_URL: string;
  REDIS_URL: string;
  API_BASE_URL: string;
  ENABLE_CACHE: boolean;
  QUERY_CACHE_KEY_PREFIX?: string;
  PLAYGROUND_DATABASE_URL: string;
  PLAYGROUND_SHADOW_DATABASE_URL: string;
  PLAYGROUND_DAILY_QUESTIONS_LIMIT: number;
  PLAYGROUND_TRUSTED_GITHUB_LOGINS: string[];
  EXPLORER_GENERATE_ANSWER_PROMPT_NAME: string;
  EXPLORER_USER_MAX_QUESTIONS_PER_HOUR: number;
  EXPLORER_USER_MAX_QUESTIONS_ON_GOING: number;
  EXPLORER_GENERATE_SQL_CACHE_TTL: number;
  EXPLORER_QUERY_SQL_CACHE_TTL: number;
  EXPLORER_OUTPUT_ANSWER_IN_STREAM: boolean;
  EMBEDDING_SERVICE_ENDPOINT: string;
  GITHUB_ACCESS_TOKENS: string[];
  OPENAI_API_KEY: string;
  AUTH0_DOMAIN: string;
  AUTH0_SECRET: string;
  TIDB_CLOUD_DATA_SERVICE_APP_ID: string;
  TIDB_CLOUD_DATA_SERVICE_PUBLIC_KEY: string;
  TIDB_CLOUD_DATA_SERVICE_PRIVATE_KEY: string;
  PUBLIC_API_HOURLY_RATE_LIMIT: number;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
  }
}

const app: FastifyPluginAsync<AppOptions, RawServerDefault, JsonSchemaToTsProvider> = async (
    fastify,
    opts
): Promise<void> => {

  // Load config.
  await fastify.register(fastifyEnv, {
    confKey: 'config',      // You can access environment variables via `fastify.config`.
    dotenv: true,
    schema: APIServerEnvSchema
  });

  // Avoid using prod database in test env.
  if (process.env.NODE_ENV === 'test' && (
    isProdDatabaseURL(fastify.config.DATABASE_URL) ||
    isProdDatabaseURL(fastify.config.SHADOW_DATABASE_URL) ||
    isProdDatabaseURL(fastify.config.PLAYGROUND_DATABASE_URL) ||
    isProdDatabaseURL(fastify.config.PLAYGROUND_SHADOW_DATABASE_URL)
  )) {
    throw new Error('DO NOT use production database in test env.');
  }

  // Init error handler.
  fastify.setErrorHandler(function (error: Error, request, reply) {
    this.log.error(error);

    if (error instanceof APIError) {
      reply.status(error.statusCode).send({
        message: error.message,
        payload: error.payload
      });
    } else {
      reply.status(500).send({
        message: error.message || 'Internal Server Error'
      });
    }
  });

  // Loads all plugins defined in ./plugins directory.
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  });

  // Loads all routes defined in ./routes directory.
  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    routeParams: true,
    options: opts
  });

  // Expose Swagger JSON.
  // Notice: Swagger docs SHOULD be initialized after all routes are registered.
  fastify.get('/docs/json', (req, reply) => {
    reply.send(fastify.swagger());
  });
};

export default app;
export { app, options };
