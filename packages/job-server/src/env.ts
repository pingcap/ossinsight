export const JobServerEnvSchema = {
  type: 'object',
  required: [
    'DATABASE_URL'
  ],
  properties: {
    DATABASE_URL: {
      type: 'string',
    },
    PLAYGROUND_DATABASE_URL: {
        type: 'string',
    }
  },
};
