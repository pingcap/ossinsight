import { NextRequest } from 'next/server';

const DEFAULT_UPSTREAM = 'https://api.ossinsight.io';

function getUpstreamBase() {
  return DEFAULT_UPSTREAM;
}

function buildUpstreamUrl(path: string[], req: NextRequest): string {
  const base = getUpstreamBase();
  const normalizedPath = path.join('/');
  const url = new URL(`/${normalizedPath}`, base);

  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}

async function proxy(req: NextRequest, path: string[]) {
  const url = buildUpstreamUrl(path, req);

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
    cache: 'no-store',
  };

  const res = await fetch(url, init);
  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete('content-encoding');

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(req, path);
}
