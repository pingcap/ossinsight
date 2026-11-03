import {Job} from 'bullmq';
import {ExplorerService} from '../plugins/services/explorer-service';
import {QuestionQueueNames, QuestionStatus} from '../plugins/services/explorer-service/types';

export const isUUID = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value);

/** Redis carries a reference, never authority to execute the SQL in its payload. */
export function questionProcessor(
  service: Pick<ExplorerService, 'getQuestionById' | 'resolveQuestion'>,
  queue: QuestionQueueNames,
  audit: (record: Record<string, unknown>) => void,
) {
  return async (job: Job): Promise<void> => {
    const reference = {event: 'explorer_worker', queue, jobId: isUUID(job.id) ? job.id : undefined};
    try {
      if (!isUUID(job.data?.id) || !isUUID(job.id)) throw new Error();
      const question = await service.getQuestionById(job.data.id);
      if (!question || question.queueJobId !== job.id || question.queueName !== queue ||
          ![QuestionStatus.Waiting, QuestionStatus.Running].includes(question.status) ||
          !Number.isSafeInteger(question.userId) || question.userId < 0 ||
          // Only an operator-created, persisted review batch may use the system user.
          (question.userId === 0 && (!isUUID(question.batchJobId) || question.needReview !== true))) {
        throw new Error();
      }
      const record = {...reference, questionId: question.id,
        actor: question.userId ? `user:${question.userId}` : `batch:${question.batchJobId}`};
      audit({...record, outcome: 'started'});
      await service.resolveQuestion(job, question);
      audit({...record, outcome: 'completed'});
      // Results stay in the owner-protected database, never in BullMQ returnvalue.
    } catch {
      audit({...reference, outcome: 'failed'});
      // BullMQ must fail the job. Do not persist SQL, prompts or driver errors in Redis.
      throw new Error('Question execution failed.');
    }
  };
}
