import { isIP } from 'node:net';

export function publicClientIdentity(headers: Pick<Headers, 'get'>, onVercel: boolean): string {
  // Vercel overwrites this header. Self-hosted requests share a bucket until a
  // trusted gateway supplies its own rate limiting; arbitrary headers are unsafe.
  if (!onVercel) return 'shared-origin';
  const value = headers.get('x-forwarded-for')?.split(',')[0].trim() || '';
  return isIP(value) ? value.toLowerCase() : 'unknown-client';
}

export function publicBudgetKind(pathname: string): 'image' | 'query' {
  return /\/(?:opengraph|twitter)-image(?:\/|$)/.test(pathname) ? 'image' : 'query';
}

export function budgetFailure(result: {success: boolean; reason?: string; reset: number}, now = Date.now()) {
  // Upstash can return success=true after its timeout. Never interpret that as a grant.
  if (result.reason === 'timeout') return {status: 503, message: 'Request quota temporarily unavailable.', retryAfter: 5};
  if (!result.success) return {status: 429, message: 'Request quota exceeded.', retryAfter: Math.max(1, Math.ceil((result.reset - now) / 1000))};
  return null;
}
