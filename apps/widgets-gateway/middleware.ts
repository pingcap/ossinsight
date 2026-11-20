import { next } from '@vercel/functions/middleware';
import { isSuppressedRequest, parseSuppressedAccounts } from './lib/suppression';

const suppressedAccounts = parseSuppressedAccounts(process.env.SUPPRESSED_GITHUB_ACCOUNTS);

export const config = {
  matcher: ['/widgets/:path*', '/analyze/:path*'],
};

/**
 * Runs before the rewrites in vercel.json, so it covers widget images, which the gateway renders,
 * and widget pages, which are passed through to the widget service.
 */
export default function middleware(request: Request) {
  if (isSuppressedRequest(new URL(request.url), suppressedAccounts)) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Widget-Gateway': 'removed' },
    });
  }
  return next();
}
