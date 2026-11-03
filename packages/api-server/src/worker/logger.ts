import pino, {DestinationStream, Logger} from 'pino';
import {isUUID} from './process-job';
import {QuestionQueueNames} from '../plugins/services/explorer-service/types';

/** Shared SQL services can log driver errors. Keep this worker's output metadata-only. */
export function workerLogger(destination?: DestinationStream) {
  const logger = pino({
    level: 'info',
    formatters: {bindings: bindings => ({
      pid: bindings.pid, hostname: bindings.hostname,
      questionId: isUUID(bindings.questionId) ? bindings.questionId : undefined,
      jobId: isUUID(bindings.jobId) ? bindings.jobId : undefined,
    })},
    hooks: {logMethod(args, method) {
      const input = args[0];
      const record: Record<string, unknown> = {};
      if (input && typeof input === 'object') {
        const data = input as Record<string, unknown>;
        if (['explorer_worker', 'worker_lifecycle'].includes(String(data.event))) record.event = data.event;
        for (const key of ['jobId', 'questionId']) if (isUUID(data[key])) record[key] = data[key];
        if (typeof data.actor === 'string' && (/^user:\d{1,16}$/.test(data.actor) ||
            (data.actor.startsWith('batch:') && isUUID(data.actor.slice(6))))) record.actor = data.actor;
        if (Object.values(QuestionQueueNames).includes(data.queue as QuestionQueueNames)) record.queue = data.queue;
        if (['started', 'completed', 'failed', 'ready', 'stopping', 'stopped'].includes(String(data.outcome))) {
          record.outcome = data.outcome;
        }
      }
      method.call(this, record, 'SQL worker event');
    }},
  }, destination);
  function protectChildBindings<Levels extends string, Only extends boolean>(instance: Logger<Levels, Only>): Logger<Levels, Only> {
    const child: typeof instance.child = instance.child.bind(instance);
    instance.child = (bindings, options) => protectChildBindings(child({
      questionId: isUUID(bindings.questionId) ? bindings.questionId : undefined,
      jobId: isUUID(bindings.jobId) ? bindings.jobId : undefined,
    }, options));
    return instance;
  }
  return protectChildBindings(logger);
}
