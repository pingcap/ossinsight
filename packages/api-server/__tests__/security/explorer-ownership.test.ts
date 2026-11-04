import Fastify from 'fastify';
import {DateTime} from 'luxon';
import questionRoute from '../../src/routes/explorer/questions/_questionId';
import tagsRoute from '../../src/routes/explorer/questions/_questionId/tags';
import {Question, QuestionStatus} from '../../src/plugins/services/explorer-service/types';
import {ExplorerService} from '../../src/plugins/services/explorer-service';
import {registerRequestAudit} from '../../src/utils/http/request-audit';
import {APIError} from '../../src/utils/error';

const id = '9bb94d62-1abe-4a6d-b05e-e871713ed721';
function fixture(): Question {
  return {id, userId: 17, hash: 'private-question-hash', title: 'A synthetic private question',
    status: QuestionStatus.Success, querySQL: 'SELECT 1', result: {fields: [], rows: [[1]]},
    recommended: false, createdAt: DateTime.utc(), hitCache: false, preceding: 0,
    batchJobId: 'internal-batch', needReview: false, plan: [{task: 'internal-db-host'}],
    answer: {revisedTitle: 'A cleaned answer', internalMetadata: 'private-value'} as any,
    error: 'synthetic raw database credentials/error', unexpectedFuturePrivateField: 'private-value'};
}

async function server(question: Question | null) {
  const app = Fastify();
  const conn = {release: jest.fn()};
  const mysql = {getConnection: jest.fn().mockResolvedValue(conn)};
  const service = {getQuestionById: jest.fn().mockResolvedValue(question),
    getQuestionTags: jest.fn().mockResolvedValue([{id: 1, name: 'example'}]),
    countPrecedingQuestions: jest.fn().mockResolvedValue(3)};
  app.decorate('mysql', mysql);
  app.decorate('explorerService', service);
  app.decorate('userService', {getUserIdOrCreate: jest.fn(async request => request.user.id)});
  app.decorateRequest('user', null);
  app.decorate('authenticate', async request => {
    const identity = {'Bearer fixture-owner': 17, 'Bearer fixture-other': 29}[request.headers.authorization];
    if (!identity) throw new APIError(401, 'Invalid authorization token.');
    request.user = {id: identity};
  });
  registerRequestAudit(app);
  await app.register(questionRoute, {prefix: '/explorer/questions/:questionId'});
  await app.register(tagsRoute, {prefix: '/explorer/questions/:questionId/tags'});
  return {app, mysql, service};
}

test.each(['', '/tags'])('private question %s denies anonymous and other-user access before reading tags', async suffix => {
  const {app, mysql} = await server(fixture());
  try {
    for (const headers of [{}, {authorization: 'Bearer fixture-other'}]) {
      const response = await app.inject({url: `/explorer/questions/${id}${suffix}`, headers});
      expect(response.statusCode).toBe(404);
      expect(response.body).not.toContain('synthetic private');
      expect(response.headers['cache-control']).toBe('no-store');
    }
    expect(mysql.getConnection).not.toHaveBeenCalled();
  } finally {await app.close();}
});

test.each(['', '/tags'])('owner can read their own question %s', async suffix => {
  const {app} = await server(fixture());
  try {
    const response = await app.inject({url: `/explorer/questions/${id}${suffix}`, headers: {authorization: 'Bearer fixture-owner'}});
    expect(response.statusCode).toBe(200);
    expect(response.headers['cdn-cache-control']).toBe('no-store');
    if (!suffix) {
      expect(response.json().querySQL).toBe('SELECT 1');
      expect(response.json().result.rows).toEqual([[1]]);
      expect(response.json().answer.revisedTitle).toBe('A cleaned answer');
      expect(response.json().error).toBe('Answer unavailable.');
      for (const key of ['userId', 'hash', 'plan', 'batchJobId', 'unexpectedFuturePrivateField']) expect(response.json()).not.toHaveProperty(key);
      expect(response.body).not.toContain('raw database');
      expect(response.body).not.toContain('private-value');
    }
  } finally {await app.close();}
});

test.each(['', '/tags'])('only explicitly published questions are readable anonymously %s', async suffix => {
  const question = fixture(); question.recommended = true;
  const {app} = await server(question);
  try {
    const url = `/explorer/questions/${id}${suffix}`;
    expect((await app.inject(url)).statusCode).toBe(200);
    expect((await app.inject({url, headers: {authorization: 'Bearer invalid'}})).statusCode).toBe(401);
    question.recommended = false;
    expect((await app.inject(url)).statusCode).toBe(404);
  } finally {await app.close();}
});

test('missing ownership is never treated as an anonymous owner; malformed UUIDs do not query the database', async () => {
  const question = fixture(); delete (question as any).userId;
  const {app, service} = await server(question);
  try {
    expect((await app.inject(`/explorer/questions/${id}`)).statusCode).toBe(404);
    service.getQuestionById.mockClear();
    expect((await app.inject('/explorer/questions/not-a-uuid')).statusCode).toBe(400);
    expect(service.getQuestionById).not.toHaveBeenCalled();
  } finally {await app.close();}
});

test('a cached question from a different user is never returned even if a cache adapter supplies it', async () => {
  const app = Fastify();
  const conn = {query: jest.fn().mockResolvedValue([[], []]), commit: jest.fn(), rollback: jest.fn(), release: jest.fn()};
  const pool = {getConnection: jest.fn().mockResolvedValue(conn)};
  const service = new ExplorerService(app.log, pool as any, {} as any, {} as any, {} as any, {} as any);
  const cached = fixture(); cached.userId = 29;
  const lookup = jest.spyOn(service, 'getLatestQuestionByHash').mockResolvedValue(cached);
  jest.spyOn(service, 'checkIfTrustedUser').mockResolvedValue(false);
  jest.spyOn(service, 'countPrecedingQuestions').mockResolvedValue(0);
  const create = jest.spyOn(service as any, 'createQuestion').mockResolvedValue(undefined);
  try {
    const result = await service.newQuestion(17, cached.title, false, true);
    expect(result.userId).toBe(17);
    expect(result.id).not.toBe(cached.id);
    expect(result.hitCache).toBe(false);
    expect(create).toHaveBeenCalledTimes(1);
    expect(lookup.mock.calls[0][2]).toBe(17);
    cached.userId = 17;
    const owned = await service.newQuestion(17, cached.title);
    expect(owned.id).toBe(cached.id);
    expect(owned.hitCache).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  } finally {await app.close();}
});
