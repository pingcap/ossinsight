const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 3;

const maxRequests = Number(process.env.EXPLORER_RATE_LIMIT) || DEFAULT_MAX_REQUESTS;

const clients = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): { ok: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const client = clients.get(ip);

  if (!client || now > client.resetAt) {
    clients.set(ip, { count: 1, resetAt: now + DEFAULT_WINDOW_MS });
    return { ok: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  client.count++;

  if (client.count > maxRequests) {
    const retryAfterSeconds = Math.ceil((client.resetAt - now) / 1000);
    return { ok: false, remaining: 0, retryAfterSeconds };
  }

  return { ok: true, remaining: maxRequests - client.count, retryAfterSeconds: 0 };
}

// Periodically clean up expired entries to prevent memory leaks.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, client] of clients) {
      if (now > client.resetAt) clients.delete(ip);
    }
  }, DEFAULT_WINDOW_MS);
}
