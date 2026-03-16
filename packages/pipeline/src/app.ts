import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import {JsonSchemaToTsProvider} from "@fastify/type-provider-json-schema-to-ts";
import { FastifyPluginAsync, RawServerDefault } from 'fastify';
import { APIServerEnvSchema } from './env';

import fastifyEnv from '@fastify/env';
import { join } from 'path';
import {APIError} from "./errors";

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

export interface AppConfig {
  CONFIGS_PATH: string;
  DATABASE_URL: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
  }
}

const app: FastifyPluginAsync<AppOptions, RawServerDefault, JsonSchemaToTsProvider> = async (app, opts): Promise<void> => {
  // Load env config.
  await app.register(fastifyEnv, {
    confKey: 'config',      // You can access environment variables via `app.config`.
    dotenv: true,
    schema: APIServerEnvSchema
  });

  // Init global error handler.
  app.setErrorHandler(function (error: Error, request, reply) {
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
  void app.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  });

  // Loads all routes defined in ./routes directory.
  await app.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    routeParams: true,
    options: opts
  });
};

export default app;
export { app, options };
