import pino from "pino";
import LoggerOptions = pino.LoggerOptions;

const opts: LoggerOptions = {
  base: {
    service: 'sync-github-data'
  },
  transport: {
    targets: [
      {
        level: process.env.LOG_LEVEL || 'info',
        target: 'pino-pretty',
        options: {
          ignore: 'pid,hostname,service',
        }
      }
    ]
  },
};

export const logger = pino(opts);