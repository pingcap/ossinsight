import { resolve } from "path";

export interface AppConfig {
  CONFIGS_PATH: string;
  DATABASE_URL: string;
  SHADOW_DATABASE_URL: string;
  SERVER_PORT: number;
  METRICS_HOST: string;
  OPERATIONS_TOKEN?: string;
  OPERATIONS_TOKEN_PREVIOUS?: string;
  OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT?: string;
  QUERY_CACHE_KEY_PREFIX: string;
}

export const PrefetchEnvSchema = {
  type: 'object',
  required: [ 'DATABASE_URL' ],
  properties: {
    METRICS_HOST: {type: 'string', default: '127.0.0.1'},
    OPERATIONS_TOKEN: {type: 'string', minLength: 32, maxLength: 256},
    OPERATIONS_TOKEN_PREVIOUS: {type: 'string', minLength: 32, maxLength: 256},
    OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT: {type: 'string', maxLength: 24},
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
