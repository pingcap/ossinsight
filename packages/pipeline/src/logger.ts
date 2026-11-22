import type {LoggerOptions} from 'pino';

const opts: LoggerOptions = {
  base: {
    service: 'api-server'
  },
  transport: {
    targets: [
      {
        level: process.env.LOG_LEVEL || 'info',
        target: 'pino-pretty',
        options: {
          ignore: 'pid,hostname,service',
        }
      },
    ]
  },
};

// fastify-cli passes this module as Fastify's logger configuration.
module.exports = opts;
