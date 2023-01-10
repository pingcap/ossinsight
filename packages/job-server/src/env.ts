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
    EMAIL_SERVER_URL: {
      type: 'string',
      default: 'http://127.0.0.1:30002/api',
    },
    PLAYGROUND_DATABASE_URL: {
      type: 'string',
    },
    EXPLORER_HIGH_QUEUE_CONCURRENT: {
      type: 'number',
      default: 20,
    },
    EXPLORER_LOW_QUEUE_CONCURRENT: {
      type: 'number',
      default: 5,
    },
    SEND_REPO_FEEDS_CRON: {
      type: 'string',
      default: '50 * * * *',
    },
    CALC_REPO_MILESTONES_CRON: {
      type: 'string',
      default: '20 * * * *',
    },
    OPENAI_API_KEY: {
      type: 'string'
    },
  },
};
