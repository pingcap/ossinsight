import vercel from '../../../../apps/web/vercel.json';
import {docsContentSecurityPolicy, isDocsHtmlPath} from '../../../../apps/docs/lib/content-security';
import {proxy} from '../../../../apps/docs/proxy';
const {NextRequest} = require('../../../../apps/docs/node_modules/next/server');
const originalEnvironment = {...process.env};

afterEach(() => {process.env = {...originalEnvironment};});

test.each(['/', '/blog', '/blog/example', '/blog/release.1', '/docs/about', '/docs/api/list-collections'])('%s receives fresh trusted nonce metadata', pathname => {
  process.env.NODE_ENV = 'production';
  const request = new NextRequest('https://docs.example.test' + pathname, {headers: {
    'x-nonce': 'caller-controlled', 'Content-Security-Policy': "script-src 'unsafe-inline'",
  }});
  const first = proxy(request);
  const second = proxy(request);
  const policy = first.headers.get('Content-Security-Policy')!;
  const nonce = policy.match(/'nonce-([^']+)'/)![1];
  expect(nonce).not.toBe('caller-controlled');
  expect(first.headers.get('x-middleware-request-x-nonce')).toBe(nonce);
  expect(first.headers.get('x-middleware-request-content-security-policy')).toBe(policy);
  expect(second.headers.get('Content-Security-Policy')).not.toBe(policy);
  for (const key of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) {
    expect(first.headers.get(key)).toBe('no-store');
  }
  expect(policy).toContain("script-src-attr 'none'");
  expect(policy.split('; ').find(value => value.startsWith('script-src '))).not.toMatch(/unsafe-inline|unsafe-eval/);
});

test.each(['/api/search', '/blog/feed.xml', '/llms-full.txt', '/llms.mdx/api/list-collections',
  '/docs/api/list-collections.mdx', '/docs/about.mdx', '/blog-assets/cover.png', '/img/example.svg',
  '/_next/static/script.js', '/favicon.png', '/robots.txt', '/sitemap.xml'])('%s keeps its non-HTML cache behavior', pathname => {
  expect(isDocsHtmlPath(pathname)).toBe(false);
  const response = proxy(new NextRequest('https://docs.example.test' + pathname));
  expect(response.headers.get('Content-Security-Policy')).toBeNull();
  expect(response.headers.get('Cache-Control')).toBeNull();
});

test('production CSP supports the owned asset origin and published media without arbitrary script execution', () => {
  const policy = docsContentSecurityPolicy('0123456789abcdefghijkl==');
  expect(policy).toContain("'strict-dynamic'");
  expect(policy).toContain("object-src 'none'");
  expect(policy).toContain("frame-ancestors 'none'");
  expect(policy).toContain('style-src');
  expect(policy).toContain('https://ossinsight-docs.vercel.app');
  expect(policy).toContain('frame-src https://www.youtube.com https://www.youtube-nocookie.com');
  expect(docsContentSecurityPolicy('0123456789abcdefghijkl==', true)).toContain("'unsafe-eval'");
  expect(() => docsContentSecurityPolicy("injected'; script-src *")).toThrow();
});

test('the web rewrite configuration preserves the destination docs CSP', () => {
  const headersFor = (pathname: string) => vercel.headers
    .filter(rule => new RegExp(`^${rule.source}$`).test(pathname)).flatMap(rule => rule.headers);
  for (const pathname of ['/blog', '/blog/example', '/docs', '/docs/about', '/docs/nested/page', '/docs/about.mdx', '/blog/feed.xml']) {
    const headers = headersFor(pathname);
    expect(headers.some(header => header.key === 'Content-Security-Policy')).toBe(false);
    expect(headers.some(header => header.key === 'X-Content-Type-Options' && header.value === 'nosniff')).toBe(true);
  }
  for (const pathname of ['/', '/api/q/example', '/blog-assets/cover.png', '/blogger', '/docsify']) {
    expect(headersFor(pathname).some(header => header.key === 'Content-Security-Policy')).toBe(true);
  }
});
