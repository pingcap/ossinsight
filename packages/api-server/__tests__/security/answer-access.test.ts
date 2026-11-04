jest.mock('../../src/utils/sqlite', () => ({saveQueryResultToSqlite: jest.fn()}));
import Fastify from 'fastify';
import answer from '../../src/routes/explorer/answer';
import playground from '../../src/routes/q/playground';
import {ExplorerService} from '../../src/plugins/services/explorer-service';
import {Question, QuestionStatus} from '../../src/plugins/services/explorer-service/types';
import {APIError} from '../../src/utils/error';
import {waitForAnswer} from '../../src/utils/answer-wait';

const cached = {id: 'existing-question', userId: 42, title: 'stats', recommended: true, hitCache: true, status: QuestionStatus.Success} as Question;

async function answerApp() {
  const app = Fastify();
  app.decorate('authenticate', async (req: any) => {
    if (req.headers.authorization !== 'Bearer test') throw new APIError(401, 'Authentication required.');
  });
  app.decorate('userService', {getUserIdOrCreate: async () => 42});
  const newQuestion = jest.fn().mockResolvedValue(cached);
  const prepareQuestion = jest.fn();
  app.decorate('explorerService', {newQuestion, prepareQuestion, getQuestionByIdOrError: async () => cached});
  await app.register(answer);
  return {app, newQuestion, prepareQuestion};
}

test('anonymous answer requests cannot create questions or spend LLM quota', async () => {
  const {app, newQuestion} = await answerApp();
  try {
    const response = await app.inject({method: 'POST', url: '/', payload: {question: 'stats'}});
    expect(response.statusCode).toBe(401);
    expect(newQuestion).not.toHaveBeenCalled();
  } finally { await app.close(); }
});

test('authenticated own-question cache hits preserve the recommendation and prepared result', async () => {
  const {app, newQuestion, prepareQuestion} = await answerApp();
  try {
    const response = await app.inject({method: 'POST', url: '/', headers: {authorization: 'Bearer test'}, payload: {question: 'stats'}});
    expect(response.statusCode).toBe(200);
    expect(newQuestion).toHaveBeenCalledWith(42, 'stats', false);
    expect(prepareQuestion).not.toHaveBeenCalled();
    expect(cached).toMatchObject({userId: 42, recommended: true, status: QuestionStatus.Success});
    await expect(ExplorerService.prototype.prepareQuestion.call({} as any, cached)).resolves.toBe(cached);
  } finally { await app.close(); }
});

test('an inconsistent cache cannot expose a different users answer', async () => {
  const {app, newQuestion, prepareQuestion} = await answerApp();
  newQuestion.mockResolvedValue({...cached, userId: 7, title: 'private other-user question'});
  try {
    const response = await app.inject({method: 'POST', url: '/', headers: {authorization: 'Bearer test'}, payload: {question: 'stats'}});
    expect(response.statusCode).toBe(500);
    expect(response.body).not.toContain('private other-user question');
    expect(prepareQuestion).not.toHaveBeenCalled();
  } finally {await app.close();}
});

test('unbounded questions fail before allocating work', async () => {
  const {app, newQuestion} = await answerApp();
  try {
    const response = await app.inject({method: 'POST', url: '/', headers: {authorization: 'Bearer test'}, payload: {question: 'x'.repeat(513)}});
    expect(response.statusCode).toBe(400);
    expect(newQuestion).not.toHaveBeenCalled();
  } finally { await app.close(); }
});

test('playground SQL requires authentication before execution', async () => {
  const app = Fastify();
  const run = jest.fn();
  app.decorate('authenticate', async () => { throw new APIError(401, 'Authentication required.'); });
  app.decorate('sqlRunner', {run});
  await app.register(playground);
  try {
    const response = await app.inject({method: 'POST', url: '/', payload: {type: 'repo', id: '42', sql: 'SELECT COUNT(*) FROM github_events'}});
    expect(response.statusCode).toBe(401);
    expect(run).not.toHaveBeenCalled();
  } finally { await app.close(); }
});

describe('answer polling', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  test('always stops after four minutes of a stuck job', async () => {
    const waiting = {...cached, status: QuestionStatus.Waiting};
    const fetch = jest.fn().mockResolvedValue(waiting);
    const pending = expect(waitForAnswer(waiting, fetch, () => false)).rejects.toMatchObject({statusCode: 504});
    await jest.advanceTimersByTimeAsync(240_000);
    await pending;
    expect(fetch.mock.calls.length).toBeLessThanOrEqual(240);
    expect(jest.getTimerCount()).toBe(0);
  });
  test('stops fetching immediately when the client disconnects', async () => {
    const fetch = jest.fn();
    await expect(waitForAnswer({...cached, status: QuestionStatus.Waiting}, fetch, () => true)).rejects.toMatchObject({statusCode: 499});
    expect(fetch).not.toHaveBeenCalled();
  });
});
