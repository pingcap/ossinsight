import {canonicalAuditIP} from '@ossinsight/types';

export function trustedClientAddress(headers?: Pick<Headers, 'get'>, onVercel = process.env.VERCEL === '1') {
  if (onVercel) {
    return {sourceIP: canonicalAuditIP(headers?.get('x-forwarded-for')?.split(',')[0].trim()) || 'unavailable', sourceIPSource: 'vercel'};
  }
  // Self-hosted origins must be private to a gateway that overwrites this
  // explicitly configured header. Never fall back to arbitrary forwarded headers.
  const header = process.env.AUDIT_TRUSTED_CLIENT_IP_HEADER;
  if (header && /^x-[a-z0-9-]{1,60}$/.test(header)) {
    return {sourceIP: canonicalAuditIP(headers?.get(header)) || 'unavailable', sourceIPSource: 'trusted-proxy'};
  }
  return {sourceIP: 'unavailable', sourceIPSource: 'unconfigured'};
}

export function publicClientIdentity(headers: Pick<Headers, 'get'>, onVercel = process.env.VERCEL === '1'): string {
  const {sourceIP} = trustedClientAddress(headers, onVercel);
  if (sourceIP === 'unavailable') throw new Error('Trusted client address is unavailable.');
  return sourceIP;
}

export type PublicBudgetKind = 'image' | 'query' | 'realtime';

export function publicBudgetKind(pathname: string): PublicBudgetKind {
  // The homepage polls these named queries every five seconds. Give only this
  // fixed set its own budget so normal polling cannot exhaust analytics access.
  if (/^\/(?:api\/)?q\/(?:events-total|events-increment|events-increment-intervals)\/?$/.test(pathname)) return 'realtime';
  return /\/(?:opengraph|twitter)-image(?:-[a-zA-Z0-9]+)?(?:\/|$)/.test(pathname) ? 'image' : 'query';
}

export function budgetFailure(result: {success: boolean; reason?: string; reset: number}, now = Date.now()) {
  // Upstash can return success=true after its timeout. Never interpret that as a grant.
  if (result.reason === 'timeout') return {status: 503, message: 'Request quota temporarily unavailable.', retryAfter: 5};
  if (!result.success) return {status: 429, message: 'Request quota exceeded.', retryAfter: Math.max(1, Math.ceil((result.reset - now) / 1000))};
  return null;
}

export function isPublicBudgetPath(pathname: string): boolean {
  // HTML, RSC navigation, metadata and text exports can all query TiDB.
  // The separate docs/blog renderer does not query TiDB.
  return pathname === '/' || /^\/(?:llms-full\.txt|sitemap\.xml)\/?$/.test(pathname) ||
    /^\/(?:api|q|gh|collections|analyze|analyze-user|compare|trending|languages)(?:\/|$)/.test(pathname);
}
