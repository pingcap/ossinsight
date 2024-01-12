import { resolve } from "path";

export interface AppConfig {
  CONFIGS_PATH: string;
  DATABASE_URL: string;
  SHADOW_DATABASE_URL: string;
  SERVER_PORT: number;
  QUERY_CACHE_KEY_PREFIX: string;
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
    },
    SERVER_PORT: {
      type: 'number',
      default: 30002
    },
    QUERY_CACHE_KEY_PREFIX: {
      type: 'string',
    }
  },
};
