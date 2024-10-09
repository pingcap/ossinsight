import envSchema from "env-schema";

export const envConfigSchema = {
  type: 'object',
  required: [ 'DATABASE_URL' ],
  properties: {
    DATABASE_URL: {
      type: 'string'
    },
    GITHUB_ACCESS_TOKENS: {
      type: 'string',
      separator: ','
    },
  }
}

export interface EnvConfig {
  DATABASE_URL: string;
  GITHUB_ACCESS_TOKENS: string[];
}

export const envConfig = envSchema<EnvConfig>({
  schema: envConfigSchema,
  env: true,
  dotenv: true
});
