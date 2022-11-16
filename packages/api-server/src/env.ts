import { resolve } from "path";

export const APIServerEnvSchema = {
  type: 'object',
  required: [ 'DATABASE_URL', 'GITHUB_ACCESS_TOKENS' ],
  properties: {
    CONFIGS_PATH: {
      type: 'string',
      default: resolve(__dirname, '..', '..', '..', 'configs')
    },
    DATABASE_URL: {
      type: 'string'
    },
    API_BASE_URL: {
      type: 'string'
    },
    ENABLE_CACHE: {
      type: 'boolean',
      default: false
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
    }
  },
};