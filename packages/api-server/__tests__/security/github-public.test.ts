import Fastify from 'fastify';
import path from 'path';
import pino from 'pino';
import {DateTime} from 'luxon';
import {GithubService, UserType, RECOMMEND_REPO_LIST_1_KEYWORD} from '../../src/plugins/services/github-service';
import reposRoute from '../../src/routes/gh/repos/search';
import usersRoute from '../../src/routes/gh/users/search';
import organizationsRoute from '../../src/routes/gh/organizations/search';
import OctokitExecutor from '../../src/core/executor/octokit-executor/OctokitExecutor';
import {eraseToken} from '../../src/utils/octokit';
import {registerRequestAudit} from '../../src/utils/http/request-audit';
import repositoryRoute from '../../src/routes/gh/repos/_owner/_repo';
import {errorHandler} from '../../src/utils/http/error-handler';

const log = pino({level: 'silent'});
const suffix = 'fixture-secret-suffix';
const envelope = (data: any) => ({data, requestedAt: DateTime.now(), finishedAt: DateTime.now(), with: suffix});
const publicRepo = {id: 1, private: false, visibility: 'public', full_name: 'owner/public', default_branch: 'main',
  owner: {id: 2, login: 'owner', email: 'private@example.invalid'}, permissions: {admin: true}, temp_clone_token: suffix};

function harness(nodes: any[] = [], repository: any = publicRepo) {
  const entries = new Map<string, any>();
  const builder = {build: jest.fn((_provider, key) => ({load: async (loader: () => Promise<any>) => {
    if (!entries.has(key)) entries.set(key, await loader());
    return entries.get(key);
  }}))};
  const executor = {
    graphql: jest.fn(async (_label, _gql, _variables, getter) => envelope(getter({search: {nodes}}))),
    request: jest.fn(async () => envelope(repository)),
  };
  const service = new GithubService(log, executor as any, builder as any, path.resolve(__dirname, '../../../../configs'));
  return {service, executor, builder, entries};
}

describe.each([['repos', reposRoute], ['users', usersRoute], ['organizations', organizationsRoute]])('%s search route', (_label, route) => {
  test.each(['is:private', 'org:secret is:internal', 'x OR is:private', 'x" OR "y', 'x\\y', '*', '-is:public', 'x\nin:email', '', 'x'.repeat(101)])('rejects search-language input %s before cache or GitHub access', async keyword => {
    const {service, executor, builder} = harness();
    const app = Fastify();
    app.decorate('githubService', service);
    await app.register(route);
    try {
      expect((await app.inject('/?keyword=' + encodeURIComponent(keyword))).statusCode).toBe(400);
      expect(executor.graphql).not.toHaveBeenCalled();
      expect(builder.build).not.toHaveBeenCalled();
    } finally { await app.close(); }
  });
});

test('repository search is scoped to public names and rejects non-public results before storing them', async () => {
  const {service, executor, entries} = harness([
    {id: 1, fullName: 'owner/public', visibility: 'PUBLIC', defaultBranchRef: {name: 'main'}, token: suffix},
    {id: 2, fullName: 'owner/private', visibility: 'PRIVATE'},
    {id: 3, fullName: 'owner/internal', visibility: 'INTERNAL'},
    {id: 4, fullName: 'owner/unknown'}, null,
  ]);
  const result = await service.searchRepos('  owner/public  ');
  expect(executor.graphql.mock.calls[0][2]).toEqual({q: '"owner/public" in:name is:public'});
  expect(result.data).toEqual([{id: 1, fullName: 'owner/public', visibility: 'PUBLIC', defaultBranchRef: {name: 'main'}}]);
  expect(JSON.stringify([...entries.values()])).not.toMatch(/private|internal|unknown|fixture-secret/);
  expect([...entries.keys()][0]).toMatch(/^gh:public:v2:/);
  const cached = [...entries.values()][0];
  cached.with = suffix;
  expect(await service.searchRepos('owner/public')).not.toHaveProperty('with');
  expect(executor.graphql).toHaveBeenCalledTimes(1);
});

test.each([UserType.USER, UserType.ORG])('user search fixes its type and searches public names only: %s', async type => {
  const {service, executor} = harness([{id: 7, login: 'reader', email: 'private@example.invalid', token: suffix}]);
  expect((await service.searchUsers('Reader Name', type)).data).toEqual([{id: 7, login: 'reader'}]);
  expect(executor.graphql.mock.calls[0][2]).toEqual({q: `"Reader Name" in:login,name type:${type}`});
});

test.each([
  {...publicRepo, private: true, visibility: 'private'},
  {...publicRepo, visibility: 'internal'},
  {...publicRepo, visibility: undefined},
])('repository metadata cannot expose non-public repositories through ID or name lookup', async repository => {
  const {service, entries} = harness([], repository);
  await expect(service.getRepoByID(1)).rejects.toMatchObject({statusCode: 404});
  await expect(service.getRepoByName('owner', 'private')).rejects.toMatchObject({statusCode: 404});
  expect(entries.size).toBe(0);
});

test('public metadata preserves display fields but drops viewer permissions, private profile fields and credential metadata', async () => {
  const {service, executor} = harness();
  const result = await service.getRepoByID(1);
  expect(result.data).toMatchObject({id: 1, full_name: 'owner/public', default_branch: 'main', owner: {login: 'owner'}});
  expect(JSON.stringify(result)).not.toMatch(/permissions|temp_clone_token|fixture-secret|private@example/);
  executor.request.mockResolvedValueOnce(envelope({id: 2, login: 'owner', public_repos: 10, total_private_repos: 99, email: 'private@example.invalid', plan: {name: 'secret'}}));
  expect((await service.getUserByID(2)).data).toEqual({id: 2, login: 'owner', public_repos: 10});
});

test('private and nonexistent repositories have indistinguishable HTTP responses', async () => {
  const responses = [];
  for (const failure of [null, {status: 404}, {response: {status: 404}}]) {
    const {builder, entries} = harness();
    const executor = new OctokitExecutor(log, [suffix]);
    const client = {log, rest: {repos: {get: async () => {
      if (failure) throw Object.assign(new Error('private upstream details'), failure);
      return {data: {...publicRepo, private: true, visibility: 'private'}};
    }}}};
    (executor as any).octokitPool = {acquire: async () => client, release: jest.fn()};
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    app.decorate('githubService', new GithubService(log, executor, builder as any, path.resolve(__dirname, '../../../../configs')));
    await app.register(repositoryRoute, {prefix: '/:owner/:repo'});
    try {
      const response = await app.inject('/owner/hidden/');
      responses.push({status: response.statusCode, body: response.json()});
      expect(entries.size).toBe(0);
    } finally { await app.close(); }
  }
  expect(responses).toEqual(Array(3).fill({status: 404, body: {message: 'GitHub resource not found.'}}));
});

test('curated repository recommendations continue to work without GitHub requests', async () => {
  const {service, executor} = harness();
  expect((await service.searchRepos(RECOMMEND_REPO_LIST_1_KEYWORD)).data.length).toBeGreaterThan(0);
  expect(executor.graphql).not.toHaveBeenCalled();
});

test('REST and GraphQL executor results and client labels contain no token fragments', async () => {
  const executor = new OctokitExecutor(log, [suffix]);
  const client = {log, graphql: jest.fn().mockResolvedValue({ok: true})};
  (executor as any).octokitPool = {acquire: async () => client, release: jest.fn()};
  const rest = await executor.request('security-test', async () => ({data: {ok: true}}));
  const graphql = await executor.graphql('security-test', 'query {}', {});
  expect(rest).not.toHaveProperty('with');
  expect(graphql).not.toHaveProperty('with');
  expect(eraseToken(suffix)).toBe('authenticated');
  expect(eraseToken(undefined)).toBe('anonymous');
  expect(JSON.stringify([rest, graphql, eraseToken(suffix)])).not.toContain(suffix.slice(-8));
});

test('anonymous GitHub metadata and search responses disable browser and CDN caching', async () => {
  const app = Fastify();
  registerRequestAudit(app);
  app.get('/gh/repos/search', async () => ({data: []}));
  try {
    const response = await app.inject('/gh/repos/search');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['cdn-cache-control']).toBe('no-store');
  } finally { await app.close(); }
});
