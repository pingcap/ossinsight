/** A per-request nonce allows Next's scripts without permitting arbitrary inline JS. */
export function contentSecurityPolicy(nonce: string, development = false): string {
  if (!/^[A-Za-z0-9+/=]{16,128}$/.test(nonce)) throw new Error('Invalid CSP nonce.');
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' https://api.ossinsight.io wss://api.ossinsight.io https://api.github.com https://*.google-analytics.com https://www.googletagmanager.com https://*.analytics.google.com https://vitals.vercel-insights.com${development ? ' ws: wss:' : ''}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(!development ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}
