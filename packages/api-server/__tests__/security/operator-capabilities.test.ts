import Fastify from 'fastify';
import {createCapabilityVerifier, OperatorCapability} from '@ossinsight/types/dist/operator-token';
import {grant} from '../helpers/operator-grants';
import {registerOperatorAuth} from '../../../pipeline/src/utils/operator-auth';

const monitor = 'fixture-monitor-reader-with-more-than-32-bytes';
const schema = 'fixture-schema-reader-with-more-than-32-bytes';
const scheduler = 'fixture-backfill-writer-with-more-than-32-bytes';
const start = Date.parse('2030-03-01T12:00:00Z');
const expiry = new Date(start + 60000).toISOString();
const entries = [
  grant(monitor, 'metrics:read', 'prometheus', expiry),
  grant(schema, 'schema:read', 'catalog', expiry),
  grant(scheduler, 'pipeline:backfill', 'warehouse', expiry),
];

test.each(['metrics:read', 'schema:read', 'pipeline:backfill'] as OperatorCapability[])('each grant authorizes exactly its capability: %s', scope => {
  let clock = start;
  const verify = createCapabilityVerifier({grants: JSON.stringify(entries)}, scope, () => clock);
  for (const [index, token] of [monitor, schema, scheduler].entries()) {
    const result = verify('Bearer ' + token);
    expect(result.status).toBe(scope === entries[index].scope ? 'accepted' : 'rejected');
    if (result.status === 'accepted') expect(result).toMatchObject({holder: entries[index].holder});
  }
  clock += 60000;
  for (const token of [monitor, schema, scheduler]) expect(verify('Bearer ' + token).status).toBe('rejected');
  clock = start;
  expect(verify('Bearer ' + monitor).status).toBe('rejected');
});

test('malformed policies and credential reuse cannot fall back to a shared secret', () => {
  for (const grants of ['broken', '{}', '[]', JSON.stringify([entries[0], {...entries[0], scope: 'schema:read'}]),
    JSON.stringify([{...entries[1], sha256: entries[0].sha256}]), JSON.stringify([{...entries[1], expiresAt: '2030-02-30T00:00:00Z'}]),
    JSON.stringify([{...entries[1], scope: 'all'}]), JSON.stringify([{...entries[1], holder: 'log\nentry'}])]) {
    const verify = createCapabilityVerifier({current: monitor, grants}, 'schema:read', () => start);
    expect(verify('Bearer ' + monitor).status).toBe('unconfigured');
  }
  expect(createCapabilityVerifier({current: monitor}, 'metrics:read')('Bearer ' + monitor).status).toBe('accepted');
  for (const scope of ['schema:read', 'pipeline:backfill'] as const) {
    expect(createCapabilityVerifier({current: monitor}, scope)('Bearer ' + monitor).status).toBe('unconfigured');
  }
});

test('pipeline grants are checked before handlers and unassigned routes fail closed', async () => {
  const app = Fastify();
  const execute = jest.fn(async request => ({actor: request.operatorActor}));
  registerOperatorAuth(app, {grants: JSON.stringify([
    grant(schema, 'schema:read', 'catalog'), grant(scheduler, 'pipeline:backfill', 'warehouse'),
  ])});
  app.post('/run', {config: {pipelineCapability: 'pipeline:backfill'}}, execute);
  app.post('/unassigned', execute);
  try {
    expect((await app.inject({method: 'POST', url: '/run', headers: {authorization: 'Bearer ' + schema}})).statusCode).toBe(401);
    expect((await app.inject({method: 'POST', url: '/unassigned', headers: {authorization: 'Bearer ' + scheduler}})).statusCode).toBe(403);
    expect(execute).not.toHaveBeenCalled();
    const result = await app.inject({method: 'POST', url: '/run', headers: {authorization: 'Bearer ' + scheduler}});
    expect(result.statusCode).toBe(200);
    expect(result.json().actor).toMatch(/^pipeline-operator:warehouse:[a-f0-9]{12}$/);
    expect(execute).toHaveBeenCalledTimes(1);
  } finally {await app.close();}
});
