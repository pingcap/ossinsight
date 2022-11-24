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
    WEB_SHELL_CONNECTION_LIMITS: {
      type: 'number',
      default: 10
    },
    WEB_SHELL_QUEUE_LIMIT: {
      type: 'number',
      default: 20
    },
    WEB_SHELL_USER: {
      type: 'string',
    },
    WEB_SHELL_PASSWORD: {
      type: 'string',
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
    // We need additional undocumented env
    // - for playground:
    //   - PLAYGROUND_SESSION_<KEY>=<VALUE>
  },
};