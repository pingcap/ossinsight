// Load the real web route handlers and authorization service. Only endpoint
// storage and database execution are replaced with an isolated fixture.
jest.mock('@/lib/server/route-audit', () => require('../../../../apps/web/lib/server/route-audit'), {virtual: true});
jest.mock('@/lib/cors', () => require('../../../../apps/web/lib/cors'), {virtual: true});
jest.mock('@/lib/data-quality', () => require('../../../../apps/web/lib/data-quality'), {virtual: true});
jest.mock('@/lib/data-service/executor/utils', () => require('../../../../apps/web/lib/data-service/executor/utils'), {virtual: true});
jest.mock('@/lib/data-service', () => ({
  ...require('../../../../apps/web/lib/data-service/executor/utils'),
  ...require('../../../../apps/web/lib/data-service/errors'),
  executeEndpoint: jest.fn(),
}), {virtual: true});
jest.mock('@/lib/data-service/endpoints', () => ({__esModule: true, default: jest.fn(), hasEndpoint: () => true}), {virtual: true});
jest.mock('../../../../apps/web/lib/data-service/query', () => ({executeRows: jest.fn()}));
jest.mock('@/lib/data-service/routes', () => require('../../../../apps/web/lib/data-service/routes'), {virtual: true});

import {withRequestAudit} from '../../../../apps/web/lib/server/request-audit';
const {NextRequest} = require('../../../../apps/web/node_modules/next/server');
const {default: loadEndpoint} = require('@/lib/data-service/endpoints');
const {executeEndpoint} = require('@/lib/data-service');
const {executeRows} = require('../../../../apps/web/lib/data-service/query');
const routes = [
  ['/api/queries', require('../../../../apps/web/app/api/queries/[...query]/route').GET],
  ['/api/q', require('../../../../apps/web/app/api/q/[...query]/route').GET],
  ['/q', require('../../../../apps/web/app/q/[...query]/route').GET],
  ['/api/q/explain', require('../../../../apps/web/app/api/q/explain/[...query]/route').GET],
  ['/q/explain', require('../../../../apps/web/app/q/explain/[...query]/route').GET],
] as const;
const query = 'collection-members-security-fixture';
let visible: boolean;
const originalEnvironment = {...process.env};

beforeEach(() => {
  delete process.env.CORS_ALLOWED_ORIGINS;
  visible = true;
  jest.clearAllMocks();
  jest.spyOn(console, 'info').mockImplementation(() => {});
  loadEndpoint.mockResolvedValue({config: {public: true, params: [{name: 'collectionId', type: 'integer', default: 7}]}, sql: 'SELECT 1'});
  executeEndpoint.mockResolvedValue({params: {collectionId: 7}, sql: 'SELECT 1', data: [{name: 'fixture'}], types: {name: 'VARCHAR'}});
  executeRows.mockImplementation(async (sql: string) => ({
    rows: sql.startsWith('SELECT id FROM collections') ? (visible ? [{id: 7}] : []) : [{id: 'TableReader'}],
    types: {id: 'VARCHAR'},
  }));
});
afterEach(() => {process.env = {...originalEnvironment}; jest.restoreAllMocks();});

function expectUncacheable(response: Response) {
  for (const name of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) {
    expect(response.headers.get(name)).toBe('no-store');
  }
  expect(response.headers.get('Expires')).toBeNull();
}

describe.each(routes)('%s collection authorization', (prefix, get) => {
  test.each(['?collectionId=7', ''])('revocation is checked for the same URL with explicit or default scope (%s)', async suffix => {
    const url = `https://example.test${prefix}/${query}${suffix}`;
    const invoke = () => get(new NextRequest(url), {params: Promise.resolve({query: [query]})});
    const first = await invoke();
    expect(first.status).toBe(200);
    expectUncacheable(first);

    visible = false;
    const second = await invoke();
    expect(second.status).toBe(404);
    expect(await second.json()).toEqual({message: 'Collection not found.'});
    expectUncacheable(second);
    const checks = executeRows.mock.calls.filter(([sql]: [string]) => sql.startsWith('SELECT id FROM collections'));
    expect(checks).toHaveLength(2);
    for (const [sql, params] of checks) {
      expect(sql).toContain('public = 1');
      expect(params).toEqual({id: 7});
    }
    expect(executeEndpoint).toHaveBeenCalledTimes(prefix.includes('/explain') ? 0 : 1);
  });
});

test('the boundary overrides legacy CDN headers and expiry even for query projections without a collection parameter', async () => {
  const response = await withRequestAudit('GET /api/queries/[...query]', async () => Response.json({data: []}, {
    headers: {'Cache-Control': 'public, max-age=60', 'CDN-Cache-Control': 'max-age=300',
      'Vercel-CDN-Cache-Control': 'max-age=3600', 'Expires': new Date(Date.now() + 3600000).toUTCString()},
  }))();
  expectUncacheable(response);
});

test('unexpected execution errors remain uncacheable and redacted', async () => {
  executeEndpoint.mockRejectedValueOnce(new Error('private execution detail'));
  const get = routes[0][1];
  const response = await get(new NextRequest(`https://example.test/api/queries/${query}`), {params: Promise.resolve({query: [query]})});
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({message: 'Internal Server Error'});
  expectUncacheable(response);
});

test('unrelated public repository images retain their existing cache policy', async () => {
  const response = await withRequestAudit('GET /api/avatar/[owner]', async () => new Response('image', {
    headers: {'Cache-Control': 'public, max-age=60', 'Vercel-CDN-Cache-Control': 'max-age=3600'},
  }))();
  expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
  expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe('max-age=3600');
});
