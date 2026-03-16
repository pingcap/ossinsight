import {resolve} from "path";

export interface AppConfig {
  CONFIGS_PATH: string;
  DATABASE_URL: string;
  GITHUB_ACCESS_TOKENS: string[];
  LOG_LEVEL: string;
}

export const SyncGitHubDataEnvSchema = {
  type: 'object',
  required: ['DATABASE_URL', 'GITHUB_ACCESS_TOKENS'],
  properties: {
    CONFIGS_PATH: {
      type: 'string',
      default: resolve(__dirname, '..', '..', '..', 'configs')
    },
    DATABASE_URL: {
      type: 'string'
    },
    GITHUB_ACCESS_TOKENS: {
      type: 'string',
      separator: ','
    },
    LOG_LEVEL: {
      type: 'string',
      default: 'info'
    }
  },
};
