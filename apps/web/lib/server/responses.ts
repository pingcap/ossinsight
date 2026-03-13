import { APIError } from '@/lib/data-service';

type CacheHeaders = {
  cacheControl?: string;
  cdnCacheControl?: string;
  vercelCdnCacheControl?: string;
};

export function jsonCachedResponse(body: unknown, cacheHeaders: CacheHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheHeaders.cacheControl ?? 'max-age=60',
      ...(cacheHeaders.cdnCacheControl ? { 'CDN-Cache-Control': cacheHeaders.cdnCacheControl } : {}),
      ...(cacheHeaders.vercelCdnCacheControl ? { 'Vercel-CDN-Cache-Control': cacheHeaders.vercelCdnCacheControl } : {}),
    },
  });
}

export function createApiErrorResponse(error: unknown) {
  if (error instanceof APIError) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }

  console.error(error);
  return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
    status: 500,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
