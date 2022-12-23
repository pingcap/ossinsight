import {Job, Queue, WorkerOptions} from 'bullmq';
import {
  CachedTableCacheProvider, QueryExecution
} from "@ossinsight/api-server";
import {FastifyInstance} from "fastify";

declare module 'fastify' {
  interface FastifyInstance {
    playgroundSQLQueue: Queue;
  }
}

export default async (
    app: FastifyInstance,
    job: Job<QueryExecution, any, string>
) => {
  if (!job.data) {
    app.log.warn("No job data provided");
    return;
  }
  const { id: executionId, querySQL, queryHash } = job.data;
  const cacheKey = `playground:${queryHash}`;
  app.log.info({ cacheKey, querySQL }, 'Executing query execution: %d', executionId);

  const conn = await app.mysql.getConnection();
  const cache = new CachedTableCacheProvider(conn);

  try {
    await app.playgroundService.executeSQLImmediately(conn, cache, cacheKey, job.data);
    app.log.info({ cacheKey }, 'Finished executing query execution: %d', executionId);
  } catch (err) {
    app.log.error({ cacheKey, err }, 'Failed to execute query execution: %d.', executionId);
  } finally {
    await conn.release();
  }
};

export const workerConfig: WorkerOptions = {
  autorun: true,
  // TODO: Keep the queue concurrency same as the number of db connections in the pool.
  concurrency: 5,
};