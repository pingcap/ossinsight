import TiDBContainer from '../container/TiDBContainer';
import RedisContainer from "../container/RedisContainer";

export default async function () {
  const tidb = new TiDBContainer();
  const tidbContainer = (globalThis as any).__tidb = await tidb.start();
  process.env.__TIDB_HOST = tidbContainer.getHost();
  process.env.__TIDB_PORT = String(tidbContainer.port);

  const redis = new RedisContainer();
  const redisContainer = (globalThis as any).__redis = await redis.start();
  process.env.__REDIS_HOST = redisContainer.getHost();
  process.env.__REDIS_PORT = String(redisContainer.port);
}
