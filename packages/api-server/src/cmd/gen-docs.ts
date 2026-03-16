import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import fastifyEnv from "@fastify/env";
import swagger from "@fastify/swagger";
import { FastifyPluginAsync, RawServerDefault } from 'fastify';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import {readFileSync, writeFileSync} from "fs";
import { join } from 'path';
import {APIServerEnvSchema} from "../env";

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions, RawServerDefault, JsonSchemaToTsProvider> = async (
  app,
  opts
): Promise<void> => {
  // Load config.
  await app.register(fastifyEnv, {
    confKey: 'config',      // You can access environment variables via `fastify.config`.
    dotenv: true,
    schema: APIServerEnvSchema
  });

  const descFilePath = join(app.config.CONFIGS_PATH, './public_api/README.md')
  const description = readFileSync(descFilePath, 'utf8');

  // Register swagger plugin.
  app.register(swagger, {
    openapi: {
      info: {
        title: 'OSSInsight Public API',
        description: description.replace(/^# OSSInsight Public API\n$/m, ''),
        version: 'v1beta'
      },
      servers: [{
        url: `${app.config.API_BASE_URL || 'https://api.ossinsight.io'}/v1`
      }],
    },
    hideUntagged: true,
  });

  // Loads all routes defined in ./routes directory.
  await app.register(AutoLoad, {
    dir: join(__dirname, '../routes/v1'),
    routeParams: true,
    prefix: '/v1',
    options: opts
  });

  const jsonFile = join(app.config.CONFIGS_PATH, './public_api/openapi.yaml');
  writeFileSync(jsonFile, app.swagger({
    yaml: true
  }));

  process.exit(0);
};

export default app;
export { app, options };
