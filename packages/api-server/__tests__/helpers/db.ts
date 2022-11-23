import { TiDBDatabase } from './TiDBContainer';
import { TiDBQueryExecutor } from '../../src/core/executor/query-executor/TiDBQueryExecutor';
import { join, basename, relative } from "path";
import { Chance } from "chance";
let container: TiDBDatabase | undefined;
let executor: TiDBQueryExecutor | undefined;

const chance = Chance();

function getRelativePath (path: string | undefined) {
  if (!path) {
    return undefined
  }
  return basename(relative(join(process.cwd(), '__tests__'), path), '.ts');
}

function underline(original?: string) {
  return original?.trim().replace(/[\s/\-.]/g, '_').slice(-64);
}

function genDatabaseName () {
  const { currentTestName, testPath } = expect.getState();
  return underline(currentTestName) ?? underline(getRelativePath(testPath)) ?? underline(chance.city()) as string;
}

export async function bootstrapTestContainer () {
  if (container) {
    return container;
  }
  const db = new TiDBDatabase(genDatabaseName());
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

export function getTestDatabase () {
  if (!container) {
    throw new Error('TiDB test container not initialized. Call and await "__tests__/helpers/db".bootstrapTestContainer().');
  }
  return container;
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
