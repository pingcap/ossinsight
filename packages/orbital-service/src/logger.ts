import pino from 'pino';

export const logger = pino({
  level: process.env.ORBITAL_LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
});
