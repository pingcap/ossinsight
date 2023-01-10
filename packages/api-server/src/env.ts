import { resolve } from "path";

export const APIServerEnvSchema = {
  type: 'object',
  required: [ 'DATABASE_URL', 'GITHUB_ACCESS_TOKENS' ],
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
      type: 'string'
    },
    REDIS_URL: {
      type: 'string',
      default: 'redis://localhost:6379/0'
    },
    API_BASE_URL: {
      type: 'string'
    },
    QUEUE_LIMIT: {
      type: 'number',
      default: 10000
    },
    CONNECTION_LIMIT: {
      type: 'number',
      default: 100
    },
    ENABLE_CACHE: {
      type: 'boolean',
      default: false
    },
    PLAYGROUND_DATABASE_URL: {
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
    GITHUB_OAUTH_CLIENT_ID: {
      type: 'string'
    },
    GITHUB_OAUTH_CLIENT_SECRET: {
      type: 'string'
    },
    GITHUB_ACCESS_TOKENS: {
      type: 'string',
      separator: ','
    },
    OPENAI_API_KEY: {
      type: 'string'
    },
    JWT_SECRET: {
      type: 'string'
    },
    JWT_COOKIE_NAME: {
      type: 'string'
    },
    JWT_COOKIE_DOMAIN: {
      type: 'string'
    },
    JWT_COOKIE_SECURE: {
      type: 'boolean'
    },
    JWT_COOKIE_SAME_SITE: {
      type: 'boolean'
    },
    AUTH0_DOMAIN: {
      type: 'string'
    },
    AUTH0_SECRET: {
      type: 'string'
    }
    // We need additional undocumented env
    // - for playground:
    //   - PLAYGROUND_SESSION_<KEY>=<VALUE>
  },
};