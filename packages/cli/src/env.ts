import envSchema from "env-schema";

export const envConfigSchema = {
  type: 'object',
  required: [ 'DATABASE_URL' ],
  properties: {
    DATABASE_URL: {
      type: 'string'
    }
  }
}

export interface EnvConfig {
  DATABASE_URL: string
}

export const envConfig = envSchema<EnvConfig>({
  schema: envConfigSchema,
  dotenv: true
});
