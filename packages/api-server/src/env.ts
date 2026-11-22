import { resolve } from "path";

export const DEFAULT_EXPLORER_GENERATE_ANSWER_PROMPT_NAME = 'explorer-generate-answer';

export const APIServerEnvSchema = {
  type: 'object',
  required: [ 'DATABASE_URL', 'REDIS_URL', 'GITHUB_ACCESS_TOKENS' ],
  properties: {
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
    REDIS_URL: {
      type: 'string',
      default: 'redis://localhost:6379/0'
    },
    API_BASE_URL: {
      type: 'string'
    },
    ENABLE_CACHE: {
      type: 'boolean',
      default: true
    },
    QUERY_CACHE_KEY_PREFIX: {
      type: 'string',
    },
    PLAYGROUND_DATABASE_URL: {
      type: 'string',
    },
    PLAYGROUND_SHADOW_DATABASE_URL: {
      type: 'string',
    },
    PLAYGROUND_DAILY_QUESTIONS_LIMIT: {
      type: 'number',
      default: 30
    },
    PLAYGROUND_QUERY_SQL_TIMEOUT: {type: 'integer', minimum: 1, maximum: 60000, default: 30000},
    EXPLORER_GENERATE_ANSWER_PROMPT_NAME: {
      type: 'string',
      default: DEFAULT_EXPLORER_GENERATE_ANSWER_PROMPT_NAME,
    },
    EXPLORER_USER_MAX_QUESTIONS_PER_HOUR: {
      type: 'number',
      default: 15
    },
    EXPLORER_USER_MAX_QUESTIONS_ON_GOING: {
      type: 'number',
      default: 2
    },
    EXPLORER_GENERATE_SQL_CACHE_TTL: {
      type: 'number',
      default: 60 * 60 * 24 * 7
    },
    EXPLORER_QUERY_SQL_CACHE_TTL: {
      type: 'number',
      default: 60 * 60 * 24
    },
    EXPLORER_OUTPUT_ANSWER_IN_STREAM: {
      type: 'boolean',
      default: false
    },
    EMBEDDING_SERVICE_ENDPOINT: {
      type: 'string'
    },
    GITHUB_ACCESS_TOKENS: {
      type: 'string',
      separator: ','
    },
    OPENAI_API_KEY: {
      type: 'string'
    },
    AUTH0_DOMAIN: {
      type: 'string'
    },
    AUTH0_SECRET: {
      type: 'string'
    },
    AUTH0_AUDIENCE: {type: 'string', minLength: 1, maxLength: 2048},
    AUTH0_ALLOWED_CLIENT_IDS: {type: 'string', separator: ',', default: ''},
    TIDB_CLOUD_DATA_SERVICE_APP_ID: {
      type: 'string'
    },
    TIDB_CLOUD_DATA_SERVICE_PUBLIC_KEY: {
      type: 'string'
    },
    TIDB_CLOUD_DATA_SERVICE_PRIVATE_KEY: {
      type: 'string'
    },
    PUBLIC_API_HOURLY_RATE_LIMIT: {
      type: 'integer',
      minimum: 1,
      maximum: 100000,
      default: 600
    }
  },
  // We need additional undocumented env
  // - for playground:
  //   - PLAYGROUND_SESSION_<KEY>=<VALUE>
};
