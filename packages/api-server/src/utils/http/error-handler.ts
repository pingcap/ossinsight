import {FastifyError, FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {BadParamsError} from '../../core/runner/query/QueryParser';
import {APIError, QueryDataUnavailableError} from '../error';

export function errorHandler(this: FastifyInstance, error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  const status = error instanceof BadParamsError ? 400 : error.statusCode;
  const statusCode = status && status >= 400 && status <= 599 ? status : 500;
  // SQL errors and upstream responses may contain credentials, prompts or schema.
  this.log.error({event: 'request_failed', requestId: request.id, actor: request.securityActor || 'anonymous', statusCode}, 'Request failed');
  if (error instanceof QueryDataUnavailableError) {
    return reply.code(503).send({message: error.message, payload: error.payload});
  }
  if (statusCode >= 500) {
    return reply.code(statusCode).send({message: 'Internal Server Error', requestId: request.id});
  }
  return reply.code(statusCode).send({
    message: error instanceof APIError ? error.message : 'Invalid request.',
    ...(error instanceof APIError && statusCode === 429 ? {payload: error.payload} : {}),
  });
}
