import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import {JsonSchemaToTsProvider} from "@fastify/type-provider-json-schema-to-ts";
import { FastifyPluginAsync, RawServerDefault } from 'fastify';
import { APIServerEnvSchema } from './env';

import fastifyEnv from '@fastify/env';
import { join } from 'path';
import {APIError} from "./errors";
import {registerOperatorAuth} from './utils/operator-auth';

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

export interface AppConfig {
  CONFIGS_PATH: string;
  DATABASE_URL: string;
  PIPELINE_OPERATOR_TOKEN?: string;
  PIPELINE_OPERATOR_TOKEN_PREVIOUS?: string;
  PIPELINE_OPERATOR_TOKEN_PREVIOUS_EXPIRES_AT?: string;
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

  registerOperatorAuth(app, {current: app.config.PIPELINE_OPERATOR_TOKEN,
    previous: app.config.PIPELINE_OPERATOR_TOKEN_PREVIOUS,
    previousExpiresAt: app.config.PIPELINE_OPERATOR_TOKEN_PREVIOUS_EXPIRES_AT});

  // Init global error handler.
  app.setErrorHandler(function (error: Error, request, reply) {
    const candidate = (error as {statusCode?: number}).statusCode;
    const status = candidate && candidate >= 400 && candidate <= 599 ? candidate : 500;
    this.log.error({event: 'pipeline_request_failed', requestId: request.id, actor: request.operatorActor || 'anonymous', statusCode: status});
    reply.status(status).send({message: status >= 500 ? 'Internal Server Error' : error instanceof APIError ? error.message : 'Invalid request.', requestId: request.id});
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
