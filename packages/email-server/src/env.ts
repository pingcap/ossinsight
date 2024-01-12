export const EmailServerEnvSchema = {
  type: 'object',
  required: [
    'DATABASE_URL',
    'MAX_CONCURRENT',
    'POSTMARK_API_KEY',
  ],
  properties: {
    DATABASE_URL: {
      type: 'string',
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
