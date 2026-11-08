import { resolve } from "path";

export const APIServerEnvSchema = {
  type: 'object',
  required: [ 'DATABASE_URL' ],
  properties: {
    CONFIGS_PATH: {
      type: 'string',
      default: resolve(__dirname, '..', '..', '..', 'configs')
    },
    DATABASE_URL: {
      type: 'string',
    },
    PIPELINE_OPERATOR_TOKEN: {type: 'string', minLength: 32, maxLength: 256},
    PIPELINE_OPERATOR_TOKEN_PREVIOUS: {type: 'string', minLength: 32, maxLength: 256},
    PIPELINE_OPERATOR_TOKEN_PREVIOUS_EXPIRES_AT: {type: 'string', maxLength: 24},
  },
};
