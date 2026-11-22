import Fastify from 'fastify';
import {auditClientAddress, auditSitemap, withRequestAudit} from '../../../../apps/web/lib/server/request-audit';
import {registerRequestAudit} from '../../src/utils/http/request-audit';
import {canonicalAuditIP, requestAuditContext} from '@ossinsight/types';
import {readFileSync} from 'fs';
import {resolve} from 'path';

const originalEnvironment = {...process.env};
afterEach(() => {jest.restoreAllMocks(); process.env = {...originalEnvironment};});

test('web audits distinguish concrete named queries and retain only bounded safe parameters', async () => {
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  const route = withRequestAudit('GET /api/q/[...query]', async (_request: Request) => Response.json({ok: true}));
  const response = await route(new Request('https://example.test/api/q/orgs/stars/trends?orgId=42&limit=10&token=private-token&keyword=private-search', {
    headers: {authorization: 'Bearer private-credential', 'x-user-id': 'forged-admin'},
  }));
  const record = JSON.parse(log.mock.calls[0][0]);
  expect(record).toMatchObject({resource: '/api/q/orgs/stars/trends', parameters: {orgId: 42, limit: 10}, omittedParameterCount: 2, actor: 'public'});
  expect(record.requestId).toBe(response.headers.get('X-Request-ID'));
  expect(JSON.stringify(record)).not.toMatch(/private-|forged-admin/);
});

test('only a platform address or an explicitly configured trusted gateway is accepted', () => {
  delete process.env.VERCEL;
  delete process.env.AUDIT_TRUSTED_CLIENT_IP_HEADER;
  const headers = new Headers({'x-forwarded-for': '203.0.113.4', 'x-real-ip': '203.0.113.5', 'x-audit-client-ip': '2001:db8::1'});
  expect(auditClientAddress(headers)).toEqual({sourceIP: 'unavailable', sourceIPSource: 'unconfigured'});
  process.env.AUDIT_TRUSTED_CLIENT_IP_HEADER = 'x-audit-client-ip';
  expect(auditClientAddress(headers)).toEqual({sourceIP: '2001:db8::1', sourceIPSource: 'trusted-proxy'});
  headers.set('x-audit-client-ip', '203.0.113.4, 203.0.113.5');
  expect(auditClientAddress(headers).sourceIP).toBe('unavailable');
  process.env.VERCEL = '1';
  expect(auditClientAddress(headers)).toEqual({sourceIP: '203.0.113.4', sourceIPSource: 'vercel'});
  for (const invalid of ['999.1.1.1', '127.1', '0x7f000001', '1.2.3.004', 'not-an-ip', ':::%', '::1%lo']) expect(canonicalAuditIP(invalid)).toBeUndefined();
  expect(canonicalAuditIP('::ffff:192.0.2.1')).toBe('::ffff:c000:201');
});

test('production refuses expensive work when the trusted client address is missing', async () => {
  jest.spyOn(console, 'info').mockImplementation(() => {});
  process.env.NODE_ENV = 'production';
  delete process.env.VERCEL;
  delete process.env.AUDIT_TRUSTED_CLIENT_IP_HEADER;
  const handler = jest.fn(async (_request: Request) => Response.json({private: true}));
  const response = await withRequestAudit('GET /llms-full.txt', handler)(new Request('https://example.test/llms-full.txt', {headers: {'x-forwarded-for': '203.0.113.4'}}));
  expect(response.status).toBe(503);
  expect(handler).not.toHaveBeenCalled();
  expect(await response.text()).not.toContain('private');
});

test('sitemap auditing preserves data and errors and records the actual outcome once', async () => {
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  process.env.VERCEL = '1';
  const headers = new Headers({'x-forwarded-for': '203.0.113.4', 'authorization': 'Bearer private-token'});
  const entries = [{url: 'https://example.test/analyze/public/repo'}];
  expect(await auditSitemap('GET /analyze/sitemap.xml', headers, async () => entries)).toBe(entries);
  const error = new Error('private SQL password=secret');
  await expect(auditSitemap('GET /sitemap.xml', headers, async () => {throw error;})).rejects.toBe(error);
  const records = log.mock.calls.map(call => JSON.parse(call[0]));
  expect(records).toHaveLength(2);
  expect(records[0]).toMatchObject({resource: '/analyze/sitemap.xml', statusCode: 200, sourceIP: '203.0.113.4'});
  expect(records[1]).toMatchObject({resource: '/sitemap.xml', statusCode: 500});
  expect(JSON.stringify(records)).not.toMatch(/private|password|secret/);
});

test('all sitemap exports and the full text export cross the audit boundary at request time', () => {
  const root = resolve(__dirname, '../../../../apps/web/app');
  for (const name of ['sitemap.ts', 'analyze/sitemap.ts', 'languages/sitemap.ts', 'trending/sitemap.ts']) {
    const source = readFileSync(resolve(root, name), 'utf8');
    expect(source).toMatch(/export default withSitemapAudit\(/);
    expect(source).toContain("export const dynamic = 'force-dynamic'");
  }
  expect(readFileSync(resolve(root, 'llms-full.txt/route.ts'), 'utf8')).toContain("export const GET = withRequestAudit('GET /llms-full.txt', handleGET)");
});

test('audit context bounds unknown paths, malformed encodings and large request inputs', () => {
  for (const url of ['/q/%ZZ?password=secret', '/q/' + 'x'.repeat(9000), '/unexpected/secret']) {
    const context = requestAuditContext('/q/*', url);
    expect(context).toEqual({resource: '/q/*', parameters: {}, omittedParameterCount: 0});
    expect(JSON.stringify(context).length).toBeLessThan(100);
  }
  const repeated = requestAuditContext('/q/*', '/q/events-total?' + 'limit=1&'.repeat(500));
  expect(repeated.parameters).toEqual({});
  expect(repeated.omittedParameterCount).toBe(500);
});

test('collection resources are resolved while duplicate, oversized and invalid parameters are omitted', async () => {
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  const route = withRequestAudit('GET /collections/api/[collectionId]/ranking', async (_request: Request) => Response.json([]));
  await route(new Request('https://example.test/collections/api/42/ranking?metric=stars&range=last-28-days&limit=10&limit=20&page=999999999999999999999&password=private-password'));
  const record = JSON.parse(log.mock.calls[0][0]);
  expect(record).toMatchObject({resource: '/collections/api/42/ranking', parameters: {metric: 'stars', range: 'last-28-days'}, omittedParameterCount: 4});
  expect(JSON.stringify(record)).not.toMatch(/private-password|999999999999999999999/);
});

test('unknown query names and malformed resource segments cannot inject log contents', async () => {
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  const route = withRequestAudit('GET /api/q/[...query]', async (_request: Request) => new Response(null, {status: 404}));
  await route(new Request('https://example.test/api/q/private-secret%0Aforged-record?token=secret'));
  const record = JSON.parse(log.mock.calls[0][0]);
  expect(record.resource).toBe('/api/q/[redacted]');
  expect(JSON.stringify(record)).not.toMatch(/private-secret|forged-record|token|secret/);
});

test('API audits resolve catch-all queries and IDs without logging untrusted parameters', async () => {
  const events: any[] = [];
  const app = Fastify({logger: {stream: {write: (line: string) => events.push(JSON.parse(line))}}});
  registerRequestAudit(app);
  app.get('/q/*', async () => ({ok: true}));
  app.get('/collections/:id', async () => ({ok: true}));
  try {
    await app.inject({url: '/q/events-total?limit=12&token=private-token'});
    await app.inject({url: '/collections/42?password=private-password'});
    const audit = events.filter(event => event.event === 'api_request');
    expect(audit[0]).toMatchObject({resource: '/q/events-total', parameters: {limit: 12}, omittedParameterCount: 1});
    expect(audit[1]).toMatchObject({resource: '/collections/42', parameters: {}, omittedParameterCount: 1});
    expect(JSON.stringify(audit)).not.toMatch(/private-token|private-password/);
  } finally { await app.close(); }
});
