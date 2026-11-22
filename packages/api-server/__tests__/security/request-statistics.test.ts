import Fastify from 'fastify';
import fp from 'fastify-plugin';
import recorder from '../../src/plugins/stats/api-request-recorder';

test('statistics retain useful collection dimensions without visitor identifiers or arbitrary input', async () => {
  const app = Fastify();
  const rows: any[][] = [];
  app.decorate('mysql', {query: async (_sql: string, [batch]: [any[][]]) => {
    rows.push(...batch);return [{affectedRows: batch.length}];
  }});
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  await app.register(fp(async () => {}, {name: '@ossinsight/tidb'}));
  await app.register(recorder);
  app.get('/q/:query', async (_request, reply) => reply.code(200).send({ok: true}));
  app.get('/documents/:name', async () => ({ok: true}));
  app.get('/failure', async () => {throw new Error('synthetic-private-error');});
  app.get('/healthy', async () => ({healthy: true}));
  app.get('/metrics', async () => 'synthetic metrics');
  try {
    await app.inject({url: '/q/collection-issues-history?collectionId=10001&limit=10&period=month&token=synthetic-private-token&sql=synthetic-private-sql',
      remoteAddress: '192.0.2.123', headers: {origin: 'https://synthetic-private-origin.invalid', authorization: 'Bearer synthetic-private-token'}});
    await app.inject('/q/collection-issues-history?collectionId=10001&collectionId=10002&limit=not-a-number');
    await app.inject('/q/synthetic-private-query-name?token=synthetic-private-token');
    await app.inject('/documents/synthetic-private-document?name=synthetic-private-name');
    await app.inject('/synthetic-private-unknown-path?collectionId=10001');
    await app.inject('/failure?token=synthetic-private-token');
    await app.inject('/healthy?token=synthetic-private-token');
    await app.inject('/metrics?collectionId=10001');
    await app.apiRequestRecorder.flush();
    expect(rows).toHaveLength(6);
    expect(rows.every(row => row[0] === '' && row[1] === '')).toBe(true);
    expect(rows[0][3]).toBe('/q/collection-issues-history');
    expect(JSON.parse(rows[0][4])).toEqual({collectionId: 10001, limit: 10, period: 'month'});
    expect(JSON.parse(rows[1][4])).toEqual({});
    expect(rows[2][3]).toBe('/q/[redacted]');
    expect(rows[3][3]).toBe('/documents/[redacted]');
    expect(rows[4][3]).toBe('unmatched');
    expect(rows[4][5]).toBe(true);expect(rows[4][6]).toBe(404);
    expect(rows[5][3]).toBe('/failure');
    expect(rows[5][5]).toBe(true);expect(rows[5][6]).toBe(500);
    expect(JSON.stringify(rows)).not.toMatch(/synthetic-private|192\.0\.2\.123/);
  } finally {await app.close();}
});
