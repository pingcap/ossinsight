import { NextResponse, type NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { budgetFailure, publicBudgetKind, publicClientIdentity } from './lib/request-policy';

const limiters = new Map<string, Ratelimit>();

function limiter(kind: 'query' | 'image') {
  const existing = limiters.get(kind);
  if (existing) return existing;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Public request quota is not configured');
  const configured = Number(kind === 'image' ? process.env.PUBLIC_IMAGE_HOURLY_RATE_LIMIT : process.env.PUBLIC_API_HOURLY_RATE_LIMIT);
  const maximum = Number.isSafeInteger(configured) && configured > 0 && configured <= 100000 ? configured : kind === 'image' ? 60 : 600;
  const value = new Ratelimit({
    redis: new Redis({url, token}),
    limiter: Ratelimit.slidingWindow(maximum, '1 h'),
    prefix: `ossinsight:${process.env.VERCEL_ENV || process.env.NODE_ENV}:public:${kind}`,
    timeout: 2500,
  });
  limiters.set(kind, value);
  return value;
}

export async function proxy(request: NextRequest) {
  if (request.method === 'OPTIONS' || process.env.NODE_ENV === 'development') return NextResponse.next();
  const requestId = crypto.randomUUID();
  try {
    const kind = publicBudgetKind(request.nextUrl.pathname);
    const identity = publicClientIdentity(request.headers, process.env.VERCEL === '1');
    const result = await limiter(kind).limit(identity);
    const failure = budgetFailure(result);
    if (failure) {
      console.warn(JSON.stringify({event: 'public_request_denied', requestId, kind, status: failure.status}));
      return NextResponse.json({message: failure.message, requestId}, {
        status: failure.status,
        headers: {'Retry-After': String(failure.retryAfter), 'Cache-Control': 'no-store'},
      });
    }
    const response = NextResponse.next();
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
  matcher: [
    '/api/:path*', '/q/:path*', '/gh/:path*', '/collections/api/:path*',
    '/analyze/:path*', '/analyze-user/:path*', '/compare/:path*',
    '/collections/:slug/opengraph-image', '/collections/:slug/twitter-image',
    '/trending/ai/api',
  ],
};
