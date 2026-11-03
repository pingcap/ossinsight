import {Server, Socket} from 'socket.io';
import {randomUUID} from 'crypto';
import {FastifyBaseLogger, FastifyPluginAsync} from 'fastify';
import {validateQueryName} from '@ossinsight/types';
import {QueryRunner} from '../../core/runner/query/QueryRunner';
import {toCompactFormat} from '../../utils/compact';
import {APIError, QueryDataUnavailableError} from '../../utils/error';
import {BadParamsError} from '../../core/runner/query/QueryParser';
import {consumePublicQuota} from '../../utils/public-quota';
import {getSocketClientIP} from '../../utils/http/forwared';
import {isAllowedSocketOrigin} from '../cors';

interface WsQueryRequest {
  qid?: string | number;
  explain?: boolean;
  excludeMeta?: boolean;
  format?: 'compact';
  query: string;
  params: Record<string, unknown>;
}

export function validateSocketQuery(value: unknown): WsQueryRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new APIError(400, 'Invalid query request.');
  const request = value as WsQueryRequest;
  try { validateQueryName(request.query); } catch { throw new APIError(400, 'Invalid query request.'); }
  if ((request.explain !== undefined && typeof request.explain !== 'boolean') ||
      (request.excludeMeta !== undefined && typeof request.excludeMeta !== 'boolean') ||
      (request.format !== undefined && request.format !== 'compact')) throw new APIError(400, 'Invalid query request.');
  if (request.qid !== undefined &&
      (!(typeof request.qid === 'string' || (typeof request.qid === 'number' && Number.isFinite(request.qid))) ||
       String(request.qid).length > 80 || /[\x00-\x1f\x7f]/.test(String(request.qid)))) throw new APIError(400, 'Invalid query request.');
  const params = request.params ?? {};
  if (typeof params !== 'object' || Array.isArray(params) || Object.keys(params).length > 50) throw new APIError(400, 'Invalid query parameters.');
  return {...request, params};
}

const root: FastifyPluginAsync = async app => {
  const io = new Server(app.server, {
    path: '/socket.io',
    maxHttpBufferSize: 16 * 1024,
    cors: {origin: (origin, callback) => callback(null, isAllowedSocketOrigin(origin, app.allowedOrigins) ? origin : false), credentials: false},
    allowRequest: (req, done) => {
      if (!isAllowedSocketOrigin(req.headers.origin, app.allowedOrigins)) {
        done('Origin not allowed', false);
        return;
      }
      void consumePublicQuota(app.redis, getSocketClientIP(req), app.config.PUBLIC_API_HOURLY_RATE_LIMIT)
        .then(() => done(undefined, true), () => done('Request quota unavailable', false));
    },
    transports: ['websocket'],
  });
  app.addHook('preClose', async () => {
    io.disconnectSockets(true);
    // Also close transports which have not joined a Socket.IO namespace yet.
    io.engine.close();
  });
  app.addHook('onClose', async () => {
    await new Promise<void>(resolve => io.close(() => resolve()));
  });
  app.addHook('onReady', async () => {
    io.on('connection', socket => {
      const identity = getSocketClientIP(socket.request);
      socketServerRoutes(app.log, socket, app.queryRunner,
        () => consumePublicQuota(app.redis, identity, app.config.PUBLIC_API_HOURLY_RATE_LIMIT));
    });
  });
};

export function socketServerRoutes(log: FastifyBaseLogger, socket: Socket, queryRunner: QueryRunner, consume: () => Promise<unknown>) {
  let inFlight = 0;
  let blockedUntil = 0;
  socket.on('q', async (input: unknown) => {
    const requestId = randomUUID();
    if (inFlight >= 2 || Date.now() < blockedUntil) {
      socket.emit('fatal-error/q', {error: {statusCode: 429, message: 'Too many requests.', requestId}});
      return;
    }
    inFlight++;
    let request: WsQueryRequest | undefined;
    let topic = 'fatal-error/q';
    try {
      await consume();
      request = validateSocketQuery(input);
      const {explain, query, qid, params, format, excludeMeta} = request;
      topic = `/q/${explain ? 'explain/' : ''}${query}${qid ? `?qid=${qid}` : ''}`;
      let result = explain ? await queryRunner.explain(query, params) : await queryRunner.query(query, params);
      const compact = format === 'compact';
      if (compact) result = {...result, data: toCompactFormat(result.data as any, result.fields)};
      const payload = excludeMeta ? {data: result.data, fields: compact ? result.fields : undefined} : result;
      socket.emit(topic, {qid, explain, payload, compact: explain ? undefined : compact});
      log.info({event: 'public_query', transport: 'websocket', actor: 'anonymous', queryName: query, requestId, statusCode: 200});
    } catch (error: any) {
      const code = error instanceof BadParamsError ? 400 : error?.statusCode;
      const statusCode = Number.isInteger(code) && code >= 400 && code <= 599 ? code : 500;
      if (statusCode === 429) blockedUntil = Date.now() + 1000 * Math.min(3600, Math.max(1, Number(error.payload?.retryAfter) || 1));
      const payload = error instanceof QueryDataUnavailableError
        ? {statusCode: 503, message: error.message, payload: error.payload, requestId}
        : {statusCode, message: statusCode >= 500 ? 'Internal Server Error' : statusCode === 429 ? 'Too many requests.' : 'Invalid query request.', requestId};
      log.warn({event: 'public_query_failed', transport: 'websocket', actor: 'anonymous', requestId, statusCode});
      socket.emit(topic, request ? {error: true, qid: request.qid, explain: request.explain, payload} : {error: payload});
    } finally {
      inFlight--;
    }
  });
}

export default root;
