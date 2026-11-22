import {Queue, Worker} from 'bullmq';
import Redis from 'ioredis';
import {createPool, Pool} from 'mysql2/promise';
import {ExplorerService} from '../plugins/services/explorer-service';
import {QuestionQueueNames} from '../plugins/services/explorer-service/types';
import {TiDBPlaygroundQueryExecutor} from '../core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import {workerConfig} from './config';
import {workerLogger} from './logger';
import {createQuestionWorker} from './queue-worker';
import {checkAnalyticsDatabase} from '../core/playground/database-policy';
import {workerOperations} from './operations';
import {operationsCredentials} from '../utils/http/operator-auth';

const disabledPreparation = async (): Promise<never> => { throw new Error('SQL worker cannot prepare questions.'); };

export async function main(checkOnly = false) {
  const log = workerLogger();
  const config = workerConfig(process.env);
  const pools: Pool[] = [];
  const queues: Queue[] = [];
  const workers: Worker[] = [];
  const operations = workerOperations(() => workers.length === 2 && redis.status === 'ready' &&
    workers.every(worker => worker.isRunning()), operationsCredentials({
      OPERATIONS_TOKEN: process.env.OPERATIONS_TOKEN,
      OPERATIONS_TOKEN_PREVIOUS: process.env.OPERATIONS_TOKEN_PREVIOUS,
      OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT: process.env.OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT,
    }));
  const redis = new Redis(config.redis, {lazyConnect: true, maxRetriesPerRequest: null,
    connectTimeout: 10000, enableOfflineQueue: false});
  redis.on('error', () => log.error({event: 'worker_lifecycle', outcome: 'failed'}));
  let closing: Promise<void> | undefined;
  const close = () => closing ??= (async () => {
    log.info({event: 'worker_lifecycle', outcome: 'stopping'});
    await operations.close();
    await Promise.all(workers.map(worker => worker.close()));
    await Promise.all(queues.map(queue => queue.close()));
    redis.disconnect();
    await Promise.all(pools.map(pool => pool.end()));
    log.info({event: 'worker_lifecycle', outcome: 'stopped'});
  })();
  try {
    const metadata = createPool(config.database);
    const analytics = createPool(config.playground);
    pools.push(metadata, analytics);
    const executor = new TiDBPlaygroundQueryExecutor(analytics, null, log,
      [], config.timeout);
    await Promise.all([redis.connect(), metadata.query('SELECT 1'), analytics.query('SELECT 1')]);
    await checkAnalyticsDatabase(analytics);
    const session = await analytics.getConnection();
    try { await session.query('SELECT 1'); } finally { session.release(); }
    // This mode does not create or consume a queue, and does not write application data.
    if (checkOnly) {
      log.info({event: 'worker_lifecycle', outcome: 'ready'});
      await close();
      return;
    }
    const high = new Queue(QuestionQueueNames.High, {connection: redis});
    const low = new Queue(QuestionQueueNames.Low, {connection: redis});
    queues.push(high, low);
    const service = new ExplorerService(log, metadata, {
      questionToAnswerInStream: disabledPreparation, questionToAnswerInNonStream: disabledPreparation,
    }, executor, low, high, {querySQLTimeout: config.timeout});
    for (const [queue, concurrency] of [[high, config.high], [low, config.low]] as const) {
      workers.push(createQuestionWorker(queue, service, concurrency, record => log.info(record)));
    }
    await Promise.all(workers.map(worker => worker.waitUntilReady()));
    await operations.listen({host: '127.0.0.1', port: 30001});
    for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => {
      void close().catch(() => { process.exitCode = 1; });
    });
    log.info({event: 'worker_lifecycle', outcome: 'ready'});
    await Promise.all(workers.map(worker => worker.run()));
    await close();
  } catch {
    log.error({event: 'worker_lifecycle', outcome: 'failed'});
    await close();
    throw new Error('SQL worker unavailable.');
  }
}

if (require.main === module) void main(process.argv.includes('--check')).catch(() => { process.exitCode = 1; });
