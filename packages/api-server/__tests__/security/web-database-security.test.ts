import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const web = path.resolve(__dirname, '../../../../apps/web');
const remote = 'mysql://app:synthetic%40password@db.example:4000/db';
function load(relative: string, connect: jest.Mock) {
  const module = {exports: {} as any};
  const dependencies: Record<string, any> = {'@tidbcloud/serverless': {connect}, '@ossinsight/types': require('@ossinsight/types'), '@/lib/data-service/executor/utils': {BIG_NUMBER_TYPES: []}};
  const code = ts.transpileModule(fs.readFileSync(path.join(web, relative), 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  new Function('require', 'module', 'exports', code)((id: string) => {
    if (!(id in dependencies)) throw new Error('Unexpected test dependency: ' + id);
    return dependencies[id];
  }, module, module.exports);
  return module.exports;
}
const factories = [
  {name: 'DATABASE_URL', source: 'lib/data-service/connection.ts', create: (api: any) => api.createTiDBConnection()},
  {name: 'EXPLORER_DATABASE_URL', source: 'lib/explorer/query.ts', create: (api: any) => api.executeExplorerSQL('SELECT 1')},
];
beforeEach(() => jest.replaceProperty(process, 'env', {...process.env, NODE_ENV: 'production'}));
afterEach(() => jest.restoreAllMocks());

for (const factory of factories) {
  test.each([
    '', 'https://app:synthetic-password@db.example/db',
    'mysql://root:synthetic-password@db.example/db',
    'mysql://tenant.root:synthetic-password@db.example/db',
    'mysql://app@db.example/db', 'mysql://app:synthetic-password@db.example/',
    remote + '?user=other', remote + '?ssl=false',
    remote + '?ssl={"rejectUnauthorized":false}', remote + '?ssl={"verifyIdentity":false}',
  ])(factory.name + ' rejects invalid identity/transport configuration %# before connecting', async value => {
    process.env[factory.name] = value;
    const connect = jest.fn(() => ({execute: jest.fn(async () => ({rows: []}))}));
    const api = load(factory.source, connect);
    await expect(Promise.resolve().then(() => factory.create(api))).rejects.toThrow();
    expect(connect).not.toHaveBeenCalled();
  });

  test(factory.name + ' validates credentials without changing HTTP-driver transport or exposing them in the URL', async () => {
    process.env[factory.name] = remote;
    const fetch = jest.fn(async () => new Response(JSON.stringify({rows: [], types: []}), {headers: {'TiDB-Session': 'synthetic-session'}}));
    const sdk = require('../../../../apps/web/node_modules/@tidbcloud/serverless');
    const connect = jest.fn(options => sdk.connect({...options, fetch}));
    const api = load(factory.source, connect);
    const value = await factory.create(api);
    if (factory.name === 'DATABASE_URL') await value.execute('SELECT 1');
    const configured = new URL(connect.mock.calls[0][0].url);
    expect(JSON.parse(configured.searchParams.get('ssl')!)).toMatchObject({rejectUnauthorized: true, verifyIdentity: true});
    const [url, options] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://http-db.example/v1beta/sql');
    expect(url).not.toContain('synthetic');
    expect(options.method).toBe('POST');
    expect(new Headers(options.headers).get('Authorization')).toBe('Basic ' + Buffer.from('app:synthetic@password').toString('base64'));
  });
}
