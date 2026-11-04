import {corsHeaders} from '../cors';

/** Edge-compatible audit boundary. Never infer a principal from request headers. */
export function withRequestAudit<A extends unknown[]>(route: string, handler: (...args: A) => Promise<Response>, rethrowControlFlow?: (error: unknown) => void) {
  return async (...args: A): Promise<Response> => {
    const requestId = crypto.randomUUID();
    const started = Date.now();
    const request = args[0] instanceof Request ? args[0] : undefined;
    const forwarded = process.env.VERCEL === '1' ? request?.headers.get('x-forwarded-for')?.split(',')[0].trim() : undefined;
    const sourceIP = forwarded && /^[a-f0-9:.]{1,45}$/i.test(forwarded) ? forwarded : 'unavailable';
    let response: Response;
    let cors: Record<string, string> = {Vary: 'Origin'};
    try {
      // Validate configuration before invoking a potentially expensive handler.
      cors = corsHeaders(request?.headers.get('origin'));
      response = await handler(...args);
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
    console.info(JSON.stringify({event: 'web_api_request', requestId, actor: 'public', route,
      method: request?.method || route.split(' ')[0], sourceIP, statusCode: response.status,
      durationMs: Date.now() - started}));
    // Rewrap rather than mutate immutable headers (e.g. Response.redirect), and
    // preserve streaming bodies without buffering them.
    return new Response(response.body, {status: response.status, statusText: response.statusText, headers});
  };
}
