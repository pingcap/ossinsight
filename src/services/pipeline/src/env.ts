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
      default: 'mysql://root@localhost:4000/gharchive_dev'
    },
  },
};
