import { resolve } from "path";

export interface AppConfig {
  CONFIGS_PATH: string;
  DATABASE_URL: string;
  SHADOW_DATABASE_URL: string;
}

export const PrefetchEnvSchema = {
  type: 'object',
  required: [ 'DATABASE_URL' ],
  properties: {
    CONFIGS_PATH: {
      type: 'string',
      default: resolve(__dirname, '..', '..', '..', 'configs')
    },
    DATABASE_URL: {
      type: 'string'
    },
    SHADOW_DATABASE_URL: {
      type: 'string'
    }
  },
};
