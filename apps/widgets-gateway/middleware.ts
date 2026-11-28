import { next } from '@vercel/functions/middleware';
import { isSuppressedRequest, parseSuppressedAccounts } from './lib/suppression';

const suppressedAccounts = parseSuppressedAccounts(process.env.SUPPRESSED_GITHUB_ACCOUNTS);

export const config = {
  matcher: ['/:path*'],
};

/**
 * Runs before the rewrites in vercel.json, so it covers widget images, which the gateway renders,
 * and widget pages, which are passed through to the widget service.
 */
export default function middleware(request: Request) {
  const url = new URL(request.url);
  const section = url.pathname.split('/')[1];
  const thumbnail = url.pathname === '/api/thumbnail';
  const route = thumbnail ? 'thumbnail' : section === 'widgets' || section === 'analyze' ? section : 'other';
  const removed = (route !== 'other') && isSuppressedRequest(url, suppressedAccounts);
  const method = ['GET', 'HEAD', 'OPTIONS'].includes(request.method) ? request.method : 'other';
  console.info(JSON.stringify({
    event: 'widget_gateway_request', requestId: crypto.randomUUID(), method, route,
    decision: removed ? 'not_found' : 'forwarded',
  }));
  if (removed) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Widget-Gateway': 'removed' },
    });
  }
  return next();
}
