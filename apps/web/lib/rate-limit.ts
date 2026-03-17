import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const DEFAULT_MAX_REQUESTS = 3;
const maxRequests = Number(process.env.EXPLORER_RATE_LIMIT) || DEFAULT_MAX_REQUESTS;

const redis = Redis.fromEnv();

export const explorerRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(maxRequests, "60 s"),
  prefix: "ossinsight:explorer",
});
