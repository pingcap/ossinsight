const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_MAX_REQUESTS = 3;

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type RedisPipelineCommand = Array<string | number>;
type RedisPipelineResult = {
  result: number | string | null;
  error?: string;
};

const maxRequests =
  parsePositiveInt(process.env.EXPLORER_RATE_LIMIT_MAX_REQUESTS) ??
  parsePositiveInt(process.env.EXPLORER_RATE_LIMIT) ??
  DEFAULT_MAX_REQUESTS;

const windowSeconds =
  parsePositiveInt(process.env.EXPLORER_RATE_LIMIT_WINDOW_SECONDS) ??
  DEFAULT_WINDOW_SECONDS;

export async function checkRateLimit(request: Request): Promise<RateLimitResult> {
  if (!isRateLimitEnabled()) {
    return allowRequest();
  }

  const clientIp = getClientIp(request);
  if (!clientIp) {
    return allowRequest();
  }

  const now = Date.now();
  const currentBucket = Math.floor(now / 1000 / windowSeconds);
  const key = `explorer-rate-limit:${clientIp}:${currentBucket}`;
  const [incrementResult] = await runRedisPipeline([
    ["INCR", key],
    ["EXPIRE", key, windowSeconds + 1],
  ]);

  const requestCount = Number(incrementResult?.result);
  if (!Number.isFinite(requestCount)) {
    throw new Error("Explorer rate limit returned an invalid counter value.");
  }

  return {
    ok: requestCount <= maxRequests,
    remaining: Math.max(maxRequests - requestCount, 0),
    retryAfterSeconds: requestCount <= maxRequests ? 0 : secondsUntilNextWindow(now),
  };
}

function allowRequest(): RateLimitResult {
  return {
    ok: true,
    remaining: maxRequests,
    retryAfterSeconds: 0,
  };
}

function getClientIp(request: Request): string | null {
  // Prefer the Vercel-specific forwarded header in production so we do not trust
  // user-supplied proxy chains directly.
  const resolvedIp =
    request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip");

  const clientIp = resolvedIp?.split(",")[0]?.trim();
  return clientIp ? clientIp : null;
}

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Explorer rate limiting requires KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN in production.",
    );
  }

  return {
    url: url.replace(/\/$/, ""),
    token,
  };
}

async function runRedisPipeline(commands: RedisPipelineCommand[]): Promise<RedisPipelineResult[]> {
  const { url, token } = getRedisConfig();
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Explorer rate limit Redis request failed with ${response.status}: ${body || response.statusText}`,
    );
  }

  const payload = (await response.json()) as RedisPipelineResult[];
  if (!Array.isArray(payload)) {
    throw new Error("Explorer rate limit Redis pipeline returned an unexpected response.");
  }

  const firstError = payload.find((item) => typeof item?.error === "string");
  if (firstError?.error) {
    throw new Error(`Explorer rate limit Redis pipeline failed: ${firstError.error}`);
  }

  return payload;
}

function isRateLimitEnabled() {
  const override = process.env.EXPLORER_RATE_LIMIT_ENABLED;

  if (override === "true") {
    return true;
  }

  if (override === "false") {
    return false;
  }

  return process.env.VERCEL_ENV === "production";
}

function secondsUntilNextWindow(now: number) {
  const elapsedSeconds = Math.floor(now / 1000) % windowSeconds;
  return Math.max(windowSeconds - elapsedSeconds, 1);
}

function parsePositiveInt(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}
