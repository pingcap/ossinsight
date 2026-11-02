/** Edge-compatible audit boundary. Never infer a principal from request headers. */
export function withRequestAudit<A extends unknown[]>(route: string, handler: (...args: A) => Promise<Response>, rethrowControlFlow?: (error: unknown) => void) {
  return async (...args: A): Promise<Response> => {
    const requestId = crypto.randomUUID();
    const started = Date.now();
    const request = args[0] instanceof Request ? args[0] : undefined;
    const forwarded = process.env.VERCEL === '1' ? request?.headers.get('x-forwarded-for')?.split(',')[0].trim() : undefined;
    const sourceIP = forwarded && /^[a-f0-9:.]{1,45}$/i.test(forwarded) ? forwarded : 'unavailable';
    let response: Response;
    try { response = await handler(...args); }
    catch (error) {
      rethrowControlFlow?.(error);
      response = Response.json({message: 'Internal Server Error', requestId}, {
        status: 500, headers: {'Cache-Control': 'no-store'},
      });
    }
    const headers = new Headers(response.headers);
    headers.set('X-Request-ID', requestId);
    // Collection visibility can be revoked independently of a deployment. Neither
    // browsers nor CDNs may reuse a previously public collection response.
    if (route.includes('/collections')) {
      for (const name of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) headers.set(name, 'no-store');
    }
    console.info(JSON.stringify({event: 'web_api_request', requestId, actor: 'public', route,
      method: request?.method || route.split(' ')[0], sourceIP, statusCode: response.status,
      durationMs: Date.now() - started}));
    // Rewrap rather than mutate immutable headers (e.g. Response.redirect), and
    // preserve streaming bodies without buffering them.
    return new Response(response.body, {status: response.status, statusText: response.statusText, headers});
  };
}
