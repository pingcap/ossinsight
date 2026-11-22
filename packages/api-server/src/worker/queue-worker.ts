import {Queue, Worker} from 'bullmq';
import {ExplorerService} from '../plugins/services/explorer-service';
import {QuestionQueueNames} from '../plugins/services/explorer-service/types';
import {questionProcessor} from './process-job';

export function createQuestionWorker(queue: Queue,
  service: Pick<ExplorerService, 'getQuestionById' | 'resolveQuestion'>,
  concurrency: number, audit: (record: Record<string, unknown>) => void,
) {
  if (!queue.opts.connection) throw new Error('Worker requires an explicit Redis connection.');
  const worker = new Worker(queue.name, questionProcessor(service, queue.name as QuestionQueueNames, audit), {
    connection: queue.opts.connection, prefix: queue.opts.prefix, concurrency, autorun: false,
    lockDuration: 90000, removeOnComplete: {age: 86400, count: 1000},
    removeOnFail: {age: 604800, count: 1000},
  });
  worker.on('error', () => audit({event: 'worker_lifecycle', outcome: 'failed'}));
  return worker;
}
