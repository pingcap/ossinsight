import {Job, WorkerOptions} from 'bullmq';
import {
  NormalTableCacheProvider, QueryExecution, QueryStatus
} from "@ossinsight/api-server";
import {FastifyInstance} from "fastify";

export default async (
    app: FastifyInstance,
    job: Job<QueryExecution, any, string>
) => {
  if (!job.data) {
    app.log.warn("No job data provided");
    return;
  }
  const { id: executionId, queryHash } = job.data;
  const cacheKey = `playground:${queryHash}`;
  const conn = await app.mysql.getConnection();
  const cache = new NormalTableCacheProvider(conn);

  try {
    const res = await app.playgroundService.executeSQL(cache, cacheKey, job.data);
    await app.queryExecutionService.finishQueryExecution(conn, {
      id: executionId,
      status: QueryStatus.Success,
      executedAt: res.executedAt,
      finishedAt: res.finishedAt,
      spent: res.spent
    });
  } catch (err: any) {
    await app.queryExecutionService.finishQueryExecution(conn, {
      id: executionId,
      status: QueryStatus.Error,
      error: err.message,
    });
  } finally {
    await conn.release();
  }
};

export const workerConfig: WorkerOptions = {
  autorun: true,
  // TODO: Keep the queue concurrency same as the number of db connections in the pool.
  concurrency: 5,
};