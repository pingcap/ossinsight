import {Queue, Worker} from 'bullmq';
import fp from "fastify-plugin";
import pino from 'pino';
import {
  TiDBPlaygroundQueryExecutor, QueryExecutionService,
  getPlaygroundSessionLimits, PlaygroundService
} from "@ossinsight/api-server";

export const PLAYGROUND_SQL_QUEUE_NAME = "playground-sql";

declare module 'fastify' {
  interface FastifyInstance {
    playgroundSQLQueue: Queue;
  }
}

export default fp(async (app) => {
  const logger = pino().child({
    'module': 'playground-sql-worker',
  });
  const playgroundExecutor = new TiDBPlaygroundQueryExecutor({
    uri: app.config.PLAYGROUND_DATABASE_URL,
  }, getPlaygroundSessionLimits());
  const queryExecutionService = new QueryExecutionService();
  const playgroundService = new PlaygroundService(app.mysql, queryExecutionService, playgroundExecutor);

  // Executing query in concurrent.
  const connectionParams = new URLSearchParams(app.config.DATABASE_URL);
  const concurrency = parseInt(connectionParams.get("connectionLimit") || "2");
  const worker = new Worker(PLAYGROUND_SQL_QUEUE_NAME, async job => {
    const { id: executionId, sql, queryKey } = job.data;
    logger.info({ queryKey, sql }, 'Executing query execution: %d', executionId);

    let conn = await app.mysql.getConnection();
    try {
      await playgroundService.executeSQLImmediately(conn, job.data);
      logger.info({ queryKey }, 'Finished executing query execution: %d', executionId);
    } catch (err) {
      logger.error({ queryKey, err }, 'Failed to execute query execution: %d.', executionId);
    } finally {
      await conn.release();
    }
  }, {
    concurrency,
  });
  logger.info('Starting playground-sql worker, status: %s, concurrency: %d.', worker.isRunning(), concurrency);

  app.addHook('onClose', async (instance) => {
    await worker.close();
  });
}, {
  name: 'playground-sql-worker',
  dependencies: [
    '@fastify/env',
    '@fastify/mysql',
  ],
});
