import pino from "pino";
import LoggerOptions = pino.LoggerOptions;

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

module.exports = pino(opts);