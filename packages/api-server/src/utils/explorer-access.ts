import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {Question} from '../plugins/services/explorer-service/types';
import {APIError} from './error';

export const questionIdSchema = {
  type: 'string',
  pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
} as const;

export function authenticateQuestionReader(app: FastifyInstance) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Invalid credentials must not silently fall back to anonymous access.
    if (request.headers.authorization !== undefined) await app.authenticate(request, reply);
  };
}

export async function getReadableQuestion(app: FastifyInstance, request: FastifyRequest, questionId: string) {
  const userId = request.headers.authorization !== undefined
    ? await app.userService.getUserIdOrCreate(request) : undefined;
  const question = await app.explorerService.getQuestionById(questionId);
  // Only the existing, trusted-user publication action makes a question public.
  // Treat missing/unpublished/other users' private questions identically.
  const ownsQuestion = typeof userId === 'number' && Number.isSafeInteger(userId) && userId > 0 && question?.userId === userId;
  if (!question || (question.recommended !== true && !ownsQuestion)) {
    throw new APIError(404, 'Question not found');
  }
  return question;
}

export function questionResponse(question: Question, queuePreceding = 0) {
  // Keep persistence metadata, ownership, execution plans and raw DB errors out
  // of the wire format, including questions explicitly published by a curator.
  return {
    id: question.id, status: question.status, title: question.title,
    revisedTitle: question.revisedTitle, notClear: question.notClear,
    assumption: question.assumption, combinedTitle: question.combinedTitle,
    sqlCanAnswer: question.sqlCanAnswer, querySQL: question.querySQL,
    engines: question.engines, recommendedQuestions: question.recommendedQuestions,
    result: question.result, chart: question.chart, answerSummary: question.answerSummary,
    answer: question.answer && {
      revisedTitle: question.answer.revisedTitle, sqlCanAnswer: question.answer.sqlCanAnswer,
      notClear: question.answer.notClear, assumption: question.answer.assumption,
      combinedTitle: question.answer.combinedTitle, querySQL: question.answer.querySQL,
      chart: question.answer.chart,
    },
    recommended: question.recommended, createdAt: question.createdAt,
    requestedAt: question.requestedAt, executedAt: question.executedAt,
    finishedAt: question.finishedAt, spent: question.spent,
    error: question.error ? 'Answer unavailable.' : undefined, errorType: question.errorType,
    hitCache: question.hitCache, preceding: question.preceding, queuePreceding,
  };
}
