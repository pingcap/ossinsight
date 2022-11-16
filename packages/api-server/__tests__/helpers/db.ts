import TiDBContainer, { StartedTiDBContainer } from './TiDBContainer';
import { TiDBQueryExecutor } from '../../src/core/executor/query-executor/TiDBQueryExecutor';

let container: StartedTiDBContainer | undefined;
let executor: TiDBQueryExecutor | undefined;

export async function bootstrapTestContainer () {
  if (container) {
    return container;
  }
  container = await new TiDBContainer('pingcap/tidb:v6.3.0').start();
  process.env.DATABASE_URL = container.url();
  return container;
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
    host: container.getHost(),
    user: 'root',
    port: container.port,
    password: container.rootPassword,
    database: container.database,
    decimalNumbers: true,
    timezone: 'Z',
  }, false);
}
