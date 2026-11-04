import {NextResponse, type NextRequest} from 'next/server';
import {docsContentSecurityPolicy, isDocsHtmlPath} from './lib/content-security';

export function proxy(request: NextRequest) {
  if (!isDocsHtmlPath(request.nextUrl.pathname)) return NextResponse.next();
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
  const csp = docsContentSecurityPolicy(nonce, process.env.NODE_ENV === 'development');
  const headers = new Headers(request.headers);
  // Never accept a caller's nonce or CSP as rendering authority.
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);
  const response = NextResponse.next({request: {headers}});
  response.headers.set('Content-Security-Policy', csp);
  for (const name of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) {
    response.headers.set(name, 'no-store');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|blog-assets(?:/|$)|img(?:/|$)).*)'],
};
