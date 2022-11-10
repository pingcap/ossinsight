export const EmailServerEnvSchema = {
  type: 'object',
  required: [
    'DATABASE_URL',
    'SEND_REPO_FEEDS_CRON',
    'CALC_REPO_MILESTONES_CRON',
    'MAX_CONCURRENT',
    'POSTMARK_API_KEY',
  ],
  properties: {
    DATABASE_URL: {
      type: 'string',
    },
    SEND_REPO_FEEDS_CRON: {
      type: 'string',
      default: '50 * * * *',
    },
    CALC_REPO_MILESTONES_CRON: {
      type: 'string',
      default: '20 * * * *',
    },
    MAX_CONCURRENT: {
      type: 'number',
      default: 10,
    },
    POSTMARK_API_KEY: {
      type: 'string',
    },
  },
};
