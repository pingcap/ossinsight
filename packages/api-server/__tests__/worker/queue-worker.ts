import {randomUUID} from 'crypto';
import {Queue, QueueEvents} from 'bullmq';
import Redis from 'ioredis';
import {createQuestionWorker} from '../../src/worker/queue-worker';
import {QuestionQueueNames, QuestionStatus} from '../../src/plugins/services/explorer-service/types';

test('real Redis: delayed startup, private results, failed jobs and graceful drain', async () => {
  if (!process.env.__REDIS_SOCKET && (!process.env.__REDIS_HOST || !process.env.__REDIS_PORT)) {
    throw new Error('An isolated test Redis is required.');
  }
  const connection = new Redis({...process.env.__REDIS_SOCKET ? {path: process.env.__REDIS_SOCKET} :
    {host: process.env.__REDIS_HOST, port: Number(process.env.__REDIS_PORT)}, maxRetriesPerRequest: null});
  const prefix = `test-${randomUUID()}`;
  const queue = new Queue(QuestionQueueNames.High, {connection, prefix});
  const events = new QueueEvents(queue.name, {connection, prefix});
  const records: any[] = [];
  const questions = new Map<string, any>();
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>(resolve => {release = resolve;});
  const started = new Promise<void>(resolve => {entered = resolve;});
  const service = {getQuestionById: async (id: string) => questions.get(id),
    resolveQuestion: async (_job: any, question: any): Promise<any> => {
      if (question.title === 'fail') throw new Error('private SQL and credential');
      if (question.title === 'drain') { entered(); await gate; }
      return {rows: 'private answer'};
    }};
  const worker = createQuestionWorker(queue, service, 1, record => records.push(record));
  let running: Promise<void> | undefined;
  async function add(title: string) {
    const id = randomUUID();
    const jobId = randomUUID();
    questions.set(id, {id, queueJobId: jobId, queueName: queue.name, userId: 42,
      status: QuestionStatus.Waiting, title, querySQL: 'SELECT * FROM github_events'});
    return queue.add(queue.name, {id}, {jobId});
  }
  try {
    await Promise.all([events.waitUntilReady(), worker.waitUntilReady()]);
    const success = await add('success');
    expect(worker.isRunning()).toBe(false);
    expect(await success.getState()).toBe('waiting');
    running = worker.run();
    expect(await success.waitUntilFinished(events, 5000)).toBeNull();
    const failed = await add('fail');
    await expect(failed.waitUntilFinished(events, 5000)).rejects.toThrow('Question execution failed.');
    expect(await failed.getState()).toBe('failed');
    expect((await queue.getJob(failed.id!))!.failedReason).toBe('Question execution failed.');
    const draining = await add('drain');
    await started;
    let closed = false;
    const closing = worker.close().then(() => {closed = true;});
    await new Promise(resolve => setTimeout(resolve, 25));
    expect(closed).toBe(false);
    release();
    await closing;
    await running;
    expect(await draining.getState()).toBe('completed');
    expect(JSON.stringify(records)).not.toContain('private');
  } finally {
    release();
    await worker.close();
    await running;
    await events.close();
    await queue.obliterate({force: true});
    await queue.close();
    await connection.quit();
  }
}, 15000);
