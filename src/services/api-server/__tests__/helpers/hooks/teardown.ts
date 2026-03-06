export default async function () {
  await (globalThis as any).__tidb.stop();
  await (globalThis as any).__redis.stop();
}