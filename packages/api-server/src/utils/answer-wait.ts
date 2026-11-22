import {Question, QuestionStatus} from '../plugins/services/explorer-service/types';
import {APIError} from './error';
import sleep from './sleep';

export async function waitForAnswer(question: Question, fetch: (id: string) => Promise<Question>, disconnected: () => boolean, timeoutMs = 240_000): Promise<Question> {
  const deadline = Date.now() + timeoutMs;
  while ([QuestionStatus.Running, QuestionStatus.Waiting].includes(question.status)) {
    if (disconnected()) throw new APIError(499, 'Client disconnected.');
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new APIError(504, 'Answer timed out.');
    await sleep(Math.min(1000, remaining));
    if (disconnected()) throw new APIError(499, 'Client disconnected.');
    if (Date.now() >= deadline) throw new APIError(504, 'Answer timed out.');
    question = await fetch(question.id);
  }
  return question;
}
