import Fastify from 'fastify';
import fp from 'fastify-plugin';
import {createPool} from 'mysql2/promise';
import tidb from '../../src/plugins/tidb';

jest.mock('mysql2/promise', () => ({createPool: jest.fn()}));

function start(grant: string) {
  (createPool as jest.Mock).mockImplementation(() => ({
    query: jest.fn(async (sql: string) => {
      if (sql === 'SELECT DATABASE() AS databaseName') return [[{databaseName: 'analytics'}]];
      if (sql === 'SHOW GRANTS FOR CURRENT_USER') return [[{grant}]];
      return [[{value: 1}]];
    }),
    execute: jest.fn(), getConnection: jest.fn(), end: jest.fn().mockResolvedValue(undefined),
  }));
  const app = Fastify();
  app.register(fp(async instance => {
    instance.decorate('config', {
      DATABASE_URL: 'mysql://app:password@localhost/app',
      PLAYGROUND_DATABASE_URL: 'mysql://reader:password@localhost/analytics?multipleStatements=true',
      PLAYGROUND_SHADOW_DATABASE_URL: 'mysql://reader:password@localhost/analytics?multipleStatements=true',
    } as any);
  }, {name: '@fastify/env'}));
  app.register(tidb);
  return app;
}

beforeEach(() => jest.clearAllMocks());

test('startup checks grants and disables multi-statements in both analytics pools', async () => {
  const app = start("GRANT SELECT ON `analytics`.`github_events` TO 'reader'@'%'");
  try {
    await app.ready();
    const options = (createPool as jest.Mock).mock.calls.map(([option]) => option);
    expect(options).toHaveLength(3);
    for (const option of options.slice(1)) {
      expect(option.connectionString).toBeUndefined();
      expect(option.uri).toContain('multipleStatements=true');
      expect(option.multipleStatements).toBe(false);
    }
  } finally {
    await app.close();
  }
});

test('startup refuses an account with broad privileges', async () => {
  const app = start("GRANT SELECT ON *.* TO 'reader'@'%'");
  try {
    await expect(app.ready()).rejects.toThrow('approved public tables');
  } finally {
    await app.close();
  }
});
