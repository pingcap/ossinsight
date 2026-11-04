import {corsHeaders} from '../cors';
import {canonicalAuditIP, requestAuditContext} from '@ossinsight/types';

export function auditClientAddress(headers?: Pick<Headers, 'get'>) {
  if (process.env.VERCEL === '1') {
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

function auditRecord(route: string, request: Request | undefined, requestId: string, started: number, statusCode: number) {
  console.info(JSON.stringify({event: 'web_api_request', requestId, actor: 'public', route,
    method: request?.method || route.split(' ')[0], ...auditClientAddress(request?.headers),
    ...requestAuditContext(route, request?.url), statusCode, durationMs: Date.now() - started}));
}

/** Metadata handlers return data, not Response; preserve their result and errors. */
export async function auditSitemap<T>(route: string, headers: Pick<Headers, 'get'>, handler: () => Promise<T> | T): Promise<T> {
  const requestId = crypto.randomUUID(), started = Date.now();
  let statusCode = 200;
  try {
    if (process.env.NODE_ENV === 'production' && auditClientAddress(headers).sourceIP === 'unavailable') throw new Error('Trusted audit client address is unavailable.');
    return await handler();
  } catch (error) { statusCode = 500; throw error; }
  finally {
    console.info(JSON.stringify({event: 'web_api_request', requestId, actor: 'public', route, method: 'GET',
      ...auditClientAddress(headers), ...requestAuditContext(route), statusCode, durationMs: Date.now() - started}));
  }
}

/** Edge-compatible audit boundary. Never infer a principal from request headers. */
export function withRequestAudit<A extends unknown[]>(route: string, handler: (...args: A) => Promise<Response>, rethrowControlFlow?: (error: unknown) => void) {
  return async (...args: A): Promise<Response> => {
    const requestId = crypto.randomUUID();
    const started = Date.now();
    const request = args[0] instanceof Request ? args[0] : undefined;
    let response: Response;
    let cors: Record<string, string> = {Vary: 'Origin'};
    try {
      // Validate configuration before invoking a potentially expensive handler.
      cors = corsHeaders(request?.headers.get('origin'));
      response = process.env.NODE_ENV === 'production' && auditClientAddress(request?.headers).sourceIP === 'unavailable'
        ? Response.json({message: 'Request audit temporarily unavailable.', requestId}, {status: 503, headers: {'Cache-Control': 'no-store'}})
        : await handler(...args);
    }
    catch (error) {
      rethrowControlFlow?.(error);
      response = Response.json({message: 'Internal Server Error', requestId}, {
        status: 500, headers: {'Cache-Control': 'no-store'},
      });
    }
    const headers = new Headers(response.headers);
    // Every audited route, including MCP and avatars, shares this policy.
    // Discard permissive headers returned by an upstream or an older handler.
    for (const name of ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials',
      'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers', 'Access-Control-Max-Age']) headers.delete(name);
    for (const [name, value] of Object.entries(cors)) {
      if (name !== 'Vary') headers.set(name, value);
    }
    const vary = (headers.get('Vary') || '').split(',').map(value => value.trim()).filter(Boolean);
    if (!vary.some(value => value === '*' || value.toLowerCase() === 'origin')) vary.push('Origin');
    headers.set('Vary', vary.join(', '));
    headers.set('X-Request-ID', requestId);
    // Any named query or explanation can expose collection data, including via
    // default parameters or a projection. Recheck visibility on every request;
    // do not let an HTTP cache bypass the data service's authorization check.
    const pathname = route.split(' ')[1] || route;
    if (route.includes('/collections') || /^\/(?:api\/)?(?:q|queries)(?:\/|$)/.test(pathname)) {
      for (const name of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) headers.set(name, 'no-store');
      headers.delete('Expires');
    }
    auditRecord(route, request, requestId, started, response.status);
    // Rewrap rather than mutate immutable headers (e.g. Response.redirect), and
    // preserve streaming bodies without buffering them.
    return new Response(response.body, {status: response.status, statusText: response.statusText, headers});
  };
}
