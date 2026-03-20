/**
 * Centralized CORS configuration for API routes.
 *
 * Reads allowed origins from the CORS_ALLOWED_ORIGINS environment variable
 * (comma-separated). Falls back to the production origin when not set.
 */

const DEFAULT_ORIGINS = ['https://ossinsight.io', 'https://www.ossinsight.io'];

function getAllowedOrigins(): string[] {
  const env = process.env.CORS_ALLOWED_ORIGINS;
  if (env) {
    return env.split(',').map((o) => o.trim()).filter(Boolean);
  }
  return DEFAULT_ORIGINS;
}

/**
 * Build CORS headers for the given request origin.
 * Returns the origin itself if it is in the allowlist, otherwise the first
 * allowed origin (browsers will block the response when it doesn't match).
 *
 * Pass `origin = '*'` to explicitly allow all origins (public embed APIs).
 */
export function corsHeaders(requestOrigin?: string | null): Record<string, string> {
  const allowed = getAllowedOrigins();

  // When the env explicitly contains '*', allow everything (backwards-compat).
  if (allowed.includes('*')) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }

  const origin =
    requestOrigin && allowed.includes(requestOrigin)
      ? requestOrigin
      : allowed[0];

  return {
    'Access-Control-Allow-Origin': origin,
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
