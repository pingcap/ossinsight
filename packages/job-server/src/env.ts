export const JobServerEnvSchema = {
  type: 'object',
  required: [
    'DATABASE_URL'
  ],
  properties: {
    DATABASE_URL: {
      type: 'string',
    },
    REDIS_URL: {
      type: 'string',
      default: 'redis://localhost:6379/0',
    },
    PLAYGROUND_DATABASE_URL: {
      type: 'string',
    }
  },
};
