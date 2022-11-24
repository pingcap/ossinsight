import TiDBContainer from '../container/TiDBContainer';

export default async function () {
  const tidb = new TiDBContainer();
  const container = (globalThis as any).__tidb = await tidb.start();
  process.env.__TIDB_HOST = container.getHost();
  process.env.__TIDB_PORT = String(container.port);
}
