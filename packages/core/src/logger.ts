import pino from "pino";

/** Shared pino logger for all OSSInsight packages. */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "ossinsight" },
  transport:
    process.env.NODE_ENV === "development" || process.env.LOG_PRETTY === "1"
      ? {
          target: "pino-pretty",
          options: { colorize: true, ignore: "pid,hostname,service" },
        }
      : undefined,
});
