import {contentSecurityPolicy} from './lib/content-security';
import { NextResponse, type NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { budgetFailure, publicBudgetKind, publicClientIdentity, isPublicBudgetPath, type PublicBudgetKind } from './lib/request-policy';
import { suppressedRequestKind } from './lib/suppressed-profiles';

const limiters = new Map<string, Ratelimit>();

function limiter(kind: PublicBudgetKind) {
  const existing = limiters.get(kind);
  if (existing) return existing;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Public request quota is not configured');
  const configured = Number(kind === 'image' ? process.env.PUBLIC_IMAGE_HOURLY_RATE_LIMIT : kind === 'realtime' ? process.env.PUBLIC_REALTIME_HOURLY_RATE_LIMIT : process.env.PUBLIC_API_HOURLY_RATE_LIMIT);
  const defaults: Record<PublicBudgetKind, number> = {query: 600, image: 60, realtime: 3600};
  const maximum = Number.isSafeInteger(configured) && configured > 0 && configured <= 100000 ? configured : defaults[kind];
  const value = new Ratelimit({
    redis: new Redis({url, token}),
    limiter: Ratelimit.slidingWindow(maximum, '1 h'),
    prefix: `ossinsight:${process.env.VERCEL_ENV || process.env.NODE_ENV}:public:${kind}`,
    timeout: 2500,
  });
  limiters.set(kind, value);
  return value;
}

const REMOVED_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page not available</title></head><body style="margin:0;background:#1a1a1b;color:#e9eaee;font:16px/1.6 system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center"><main><h1 style="font-size:22px;margin:0 0 8px">This page is not available</h1><p style="margin:0;color:#a0a0a8">The page you are looking for has been removed.</p></main></body></html>`;

function suppressedResponse(kind: 'page' | 'data') {
  // 410 tells search engines the page is gone for good, so they drop it quickly.
  const headers = {'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex'};
  if (kind === 'page') {
    return new NextResponse(REMOVED_PAGE, {status: 410, headers: {...headers, 'Content-Type': 'text/html; charset=utf-8'}});
  }
  return NextResponse.json({message: 'Not found.'}, {status: 404, headers});
}

export async function proxy(request: NextRequest) {
  // Accounts whose owners asked to be removed are answered here, before any page renders or any query runs.
  const suppressed = suppressedRequestKind(request.nextUrl.pathname, request.nextUrl.searchParams);
  if (suppressed) return suppressedResponse(suppressed);

  const development = process.env.NODE_ENV === 'development';
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
  const csp = contentSecurityPolicy(nonce, development);
  const headers = new Headers(request.headers);
  // Replace caller-supplied security metadata before the renderer sees it.
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);
  const next = NextResponse.next({request: {headers}});
  next.headers.set('Content-Security-Policy', csp);
  if (!development) next.headers.set('Strict-Transport-Security', 'max-age=31536000');
  if (request.method === 'OPTIONS' || development || !isPublicBudgetPath(request.nextUrl.pathname)) return next;
  const requestId = crypto.randomUUID();
  try {
    const kind = publicBudgetKind(request.nextUrl.pathname);
    const identity = publicClientIdentity(request.headers);
    const result = await limiter(kind).limit(identity);
    const failure = budgetFailure(result);
    if (failure) {
      console.warn(JSON.stringify({event: 'public_request_denied', requestId, kind, status: failure.status}));
      return NextResponse.json({message: failure.message, requestId}, {
        status: failure.status,
        headers: {'Retry-After': String(failure.retryAfter), 'Cache-Control': 'no-store'},
      });
    }
    const response = next;
    response.headers.set('X-RateLimit-Limit', String(result.limit));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    return response;
  } catch {
    console.error(JSON.stringify({event: 'public_request_quota_unavailable', requestId}));
    return NextResponse.json({message: 'Request quota temporarily unavailable.', requestId}, {
      status: 503, headers: {'Retry-After': '5', 'Cache-Control': 'no-store'},
    });
  }
}

export const config = {
  // Docs/blog are rewritten to the separate docs deployment. Static assets do
  // not render a document; all other web routes receive a fresh nonce.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|blog(?:/|$)|docs(?:/|$)|blog-assets(?:/|$)).*)'],
};
