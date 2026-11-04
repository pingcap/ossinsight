import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {APIError} from '../../../../apps/web/lib/data-service/executor/utils';
import {withRequestAudit} from '../../../../apps/web/lib/server/request-audit';
import * as cors from '../../../../apps/web/lib/cors';

const web = path.resolve(__dirname, '../../../../apps/web');
function load(file: string, dependencies: Record<string, unknown>): any {
  const module = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}}).outputText;
  const dependency = (id: string): any => {
    if (id in dependencies) return dependencies[id];
    if (id.startsWith('@/lib/github-search/recommend/') && id.endsWith('.json')) return JSON.parse(fs.readFileSync(path.join(web, id.slice(2)), 'utf8'));
    if (id === './search-keyword' || id === '@/lib/server/search-keyword') return load(path.join(web, 'lib/server/search-keyword.ts'), dependencies);
    throw new Error('Unexpected test dependency: ' + id);
  };
  new Function('require', 'module', 'exports', code)(dependency, module, module.exports);
  return module.exports;
}
function harness() {
  const executeRows = jest.fn(async () => ({rows: []}));
  const dependencies = {'@ossinsight/types': require('@ossinsight/types'), '@/lib/cors': cors,
    '@/lib/data-service': {APIError}, '@/lib/data-quality': {}, '@/lib/collections': {},
    '@/lib/data-service/routes': {}, '@/lib/data-service/query': {executeRows},
    '@/lib/server/route-audit': {withRequestAudit}};
  const api = load(path.join(web, 'lib/server/internal-api.ts'), dependencies);
  const routes = ['repos', 'users', 'organizations'].map(name => load(path.join(web, `app/gh/${name}/search/route.ts`), {...dependencies, '@/lib/server/internal-api': api}));
  return {api, executeRows, routes};
}

test.each(['%', '_', 'a%', '%a%b%', 'x'.repeat(101), 'a\\b', 'x\nname', 'x"y'])('invalid web search %s is rejected before any SQL in all three routes', async keyword => {
  const {routes, executeRows} = harness();
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  try {
    for (const route of routes) {
      const response = await route.GET(new Request('https://ossinsight.io/gh/repos/search?keyword=' + encodeURIComponent(keyword)));
      expect(response.status).toBe(400);
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    }
    expect(executeRows).not.toHaveBeenCalled();
  } finally {log.mockRestore();}
});

test('literal underscores are escaped in every LIKE predicate and never change exact equality parameters', async () => {
  const {api, executeRows} = harness();
  await api.searchRepos('  owner/repo_name  ');
  await api.searchUsers('some_name', 'user');
  await api.searchUsers('some_org', 'org');
  for (const [sql, params] of executeRows.mock.calls as any[]) {
    expect(params.keywordPrefix).toBe(params.keyword.replaceAll('_', '!_'));
    const predicates = sql.split('\n').filter((line: string) => line.includes(' LIKE '));
    expect(predicates.length).toBeGreaterThan(0);
    for (const line of predicates) {
      expect(line).toContain(':keywordPrefix');
      expect(line).toContain("ESCAPE '!'");
    }
    expect(sql).toContain('= LOWER(:keyword)');
  }
});

test('direct search callers cannot bypass validation; empty input and recommendations avoid SQL', async () => {
  const {api, executeRows} = harness();
  await expect(api.searchRepos('%')).rejects.toMatchObject({statusCode: 400});
  await expect(api.searchUsers('x'.repeat(101), 'user')).rejects.toMatchObject({statusCode: 400});
  expect(await api.searchRepos('')).toEqual([]);
  expect(await api.searchUsers(' ', 'user')).toEqual([]);
  expect((await api.searchRepos('recommend-repo-list-1-keyword')).length).toBeGreaterThan(0);
  expect((await api.searchRepos('recommend-repo-list-2-keyword')).length).toBeGreaterThan(0);
  expect((await api.searchUsers('recommend-user-list-keyword', 'user')).length).toBeGreaterThan(0);
  expect((await api.searchUsers('recommend-org-list-keyword', 'org')).length).toBeGreaterThan(0);
  expect(executeRows).not.toHaveBeenCalled();
});

test('ambiguous duplicate keywords are rejected while missing keywords preserve an empty success', async () => {
  const {routes, executeRows} = harness();
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  try {
    for (const route of routes) {
      expect((await route.GET(new Request('https://ossinsight.io/gh/repos/search?keyword=one&keyword=two'))).status).toBe(400);
      const empty = await route.GET(new Request('https://ossinsight.io/gh/repos/search'));
      expect(empty.status).toBe(200);
      expect(await empty.json()).toEqual({data: []});
    }
    expect(executeRows).not.toHaveBeenCalled();
  } finally {log.mockRestore();}
});

test('the maximum-length plain term remains supported and SQL values stay bound', async () => {
  const {api, executeRows} = harness();
  const keyword = 'a'.repeat(100);
  await api.searchRepos(keyword);
  const [sql, params] = executeRows.mock.calls[0] as any;
  expect(params).toEqual({keyword, keywordPrefix: keyword});
  expect(sql).not.toContain(keyword);
});
