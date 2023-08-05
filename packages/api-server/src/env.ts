import { resolve } from "path";

export const DEFAULT_ANSWER_PROMPT_TEMPLATE = 'explorer-generate-answer';

export const APIServerEnvSchema = {
  type: 'object',
  required: [ 'DATABASE_URL', 'REDIS_URL', 'GITHUB_ACCESS_TOKENS' ],
  properties: {
    CONFIGS_PATH: {
      type: 'string',
      default: resolve(__dirname, '..', '..', '..', 'configs')
    },
    ADMIN_EMAIL: {
      type: 'string',
      default: 'ossinsight@pingcap.com'
    },
    DATABASE_URL: {
      type: 'string',
      default: 'mysql://root@localhost:4000/gharchive_dev?timezone=Z&decimalNumbers=true'
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
    PLAYGROUND_TRUSTED_GITHUB_LOGINS: {
      type: 'string',
      separator: ',',
      default: ''
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
    EMBEDDING_SERVICE_ENDPOINT: {
      type: 'string'
    },
    PROMPT_TEMPLATE_NAME: {
      type: 'string',
      default: DEFAULT_ANSWER_PROMPT_TEMPLATE,
    },
    TIDB_CLOUD_DATA_SERVICE_APP_ID: {
      type: 'string'
    },
    TIDB_CLOUD_DATA_SERVICE_PUBLIC_KEY: {
      type: 'string'
    },
    TIDB_CLOUD_DATA_SERVICE_PRIVATE_KEY: {
      type: 'string'
    }
  },
  // We need additional undocumented env
  // - for playground:
  //   - PLAYGROUND_SESSION_<KEY>=<VALUE>
};
