/**
 * Centralized CORS configuration for API routes.
 *
 * Reads allowed origins from the CORS_ALLOWED_ORIGINS environment variable
 * (comma-separated exact HTTPS origins). No wildcard or credentialed access.
 */

const DEFAULT_ORIGINS = ['https://ossinsight.io', 'https://www.ossinsight.io'];

function getAllowedOrigins(): string[] {
  const env = process.env.CORS_ALLOWED_ORIGINS;
  if (!env?.trim()) return DEFAULT_ORIGINS;
  const origins = env.split(',').map((origin) => origin.trim()).filter(Boolean);
  if (!origins.length) throw new Error('CORS origins must be exact HTTPS origins');
  return [...new Set(origins.map((origin) => {
    let url: URL;
    try { url = new URL(origin); } catch { throw new Error('CORS origins must be exact HTTPS origins'); }
    const local = process.env.NODE_ENV === 'development' && url.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((!local && url.protocol !== 'https:') || url.origin !== origin || url.hostname.includes('*') || url.username || url.password) {
      throw new Error('CORS origins must be exact HTTPS origins');
    }
    return origin;
  }))];
}

/**
 * Build CORS headers for the given request origin.
 * Only an exact allowlist match receives permission. Vary also accompanies
 * absent/rejected origins so shared caches cannot mix response policies.
 */
export function corsHeaders(requestOrigin?: string | null): Record<string, string> {
  const allowed = getAllowedOrigins();

  if (!requestOrigin || !allowed.includes(requestOrigin)) return {Vary: 'Origin'};

  return {
    'Access-Control-Allow-Origin': requestOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

/**
 * Convenience: 204 preflight response.
 */
export function corsPreflight(requestOrigin?: string | null) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(requestOrigin),
  });
}
