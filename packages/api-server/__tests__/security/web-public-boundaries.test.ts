import {corsHeaders, corsPreflight} from '../../../../apps/web/lib/cors';
import {withRequestAudit} from '../../../../apps/web/lib/server/request-audit';
import {isPublicBudgetPath} from '../../../../apps/web/lib/request-policy';

const originalEnvironment = {...process.env};
beforeEach(() => {
  delete process.env.CORS_ALLOWED_ORIGINS;
  process.env.NODE_ENV = 'production';
});
afterEach(() => { process.env = {...originalEnvironment}; jest.restoreAllMocks(); });

test.each(['https://ossinsight.io', 'https://www.ossinsight.io'])('an exact first-party origin %s can read public APIs', origin => {
  expect(corsHeaders(origin)).toEqual({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  });
});

test.each([undefined, null, 'null', '*', 'https://evil.test', 'https://ossinsight.io.evil.test'])('unmatched origin %s receives no CORS permission', origin => {
  expect(corsHeaders(origin)).toEqual({Vary: 'Origin'});
  expect(corsPreflight(origin).headers.get('Access-Control-Allow-Origin')).toBeNull();
});

test.each(['*', 'null', 'http://ossinsight.io', 'https://ossinsight.io/',
  'https://ossinsight.io/path', 'https://ossinsight.io?query=1', 'https://ossinsight.io#fragment',
  'https://user:password@ossinsight.io', 'https://*.vercel.app', ',,'])('unsafe configured origin %s fails closed', origin => {
  process.env.CORS_ALLOWED_ORIGINS = origin;
  expect(() => corsHeaders('https://ossinsight.io')).toThrow('exact HTTPS origins');
});

test('explicit exact origins and development-only loopback remain available', () => {
  process.env.CORS_ALLOWED_ORIGINS = ' https://api-client.example, https://api-client.example ';
  expect(corsHeaders('https://api-client.example')['Access-Control-Allow-Origin']).toBe('https://api-client.example');
  process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:3001';
  expect(() => corsHeaders('http://localhost:3001')).toThrow();
  process.env.NODE_ENV = 'development';
  expect(corsHeaders('http://localhost:3001')['Access-Control-Allow-Origin']).toBe('http://localhost:3001');
});

test.each(['GET /api/mcp', 'GET /api/avatar/[owner]', 'GET /api/q/[...query]'])('audited %s cannot restore wildcard or credentialed access', async route => {
  process.env.VERCEL = '1';
  jest.spyOn(console, 'info').mockImplementation(() => {});
  const handler = withRequestAudit(route, async (_request: Request) => new Response('public', {
    headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400', Vary: 'Accept-Encoding, RSC'},
  }));
  for (const origin of ['https://ossinsight.io', 'https://www.ossinsight.io', 'https://evil.test']) {
    const response = await handler(new Request('https://ossinsight.io/api/test', {headers: {origin, 'x-forwarded-for': '203.0.113.4'}}));
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin === 'https://evil.test' ? null : origin);
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBeNull();
    expect(response.headers.get('Access-Control-Max-Age')).toBeNull();
    expect(response.headers.get('Vary')).toBe('Accept-Encoding, RSC, Origin');
    expect(await response.text()).toBe('public');
  }
});

test('invalid CORS configuration prevents handler execution without exposing configuration or credentials', async () => {
  process.env.CORS_ALLOWED_ORIGINS = 'https://user:secret@ossinsight.io';
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  const action = jest.fn(async (_request: Request) => Response.json({data: []}));
  const response = await withRequestAudit('GET /api/mcp', action)(new Request('https://ossinsight.io/api/mcp'));
  expect(response.status).toBe(500);
  expect(action).not.toHaveBeenCalled();
  expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  expect(response.headers.get('Vary')).toBe('Origin');
  expect(JSON.stringify([await response.json(), log.mock.calls])).not.toContain('secret');
});

test.each(['/', '/llms-full.txt', '/sitemap.xml', '/trending', '/trending/ai',
  '/trending/overall', '/languages', '/languages/TypeScript', '/collections/example',
  '/collections/example/opengraph-image', '/analyze/pingcap/tidb', '/api/mcp', '/api/avatar/octocat'])('database-backed request %s consumes quota', pathname => {
  expect(isPublicBudgetPath(pathname)).toBe(true);
});

test.each(['/favicon.ico', '/seo-widgets-homepage.jpeg', '/_next/static/chunk.js', '/docs/api', '/blog/post'])('content without database work at %s remains independent of database quota', pathname => {
  expect(isPublicBudgetPath(pathname)).toBe(false);
});
