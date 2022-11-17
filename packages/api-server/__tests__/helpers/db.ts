import { TiDBDatabase } from './TiDBContainer';
import { TiDBQueryExecutor } from '../../src/core/executor/query-executor/TiDBQueryExecutor';
import Chance from 'chance';

let container: TiDBDatabase | undefined;
let executor: TiDBQueryExecutor | undefined;

const chance = Chance()

function randomDatabase () {
  return chance.city().replace(/\s/g, '_').toLowerCase();
}

export async function bootstrapTestContainer () {
  if (container) {
    return container;
  }
  const db = new TiDBDatabase(randomDatabase());
  await db.ready;
  process.env.DATABASE_URL = db.url();
  container = db;
  return db;
}

export async function releaseTestContainer () {
  await executor?.destroy();
  executor = undefined;
  const c = await container;
  if (c) {
    process.env.DATABASE_URL = '';
  }
  container = undefined;
  await c?.stop();
}

export function getExecutor (): TiDBQueryExecutor {
  if (!container) {
    throw new Error('TiDB test container not initialized. Call and await "__tests__/helpers/db".bootstrapTestContainer().');
  }
  return new TiDBQueryExecutor({
    host: container.host,
    user: 'executoruser',
    port: container.port,
    password: 'executorpassword',
    database: container.database,
    decimalNumbers: true,
    timezone: 'Z',
  }, false);
}
