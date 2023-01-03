import { Server, Socket } from 'socket.io';

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { QueryRunner } from "../../core/runner/query/QueryRunner";
import fastifyWebsocket from "fastify-socket.io";
import { pino } from "pino";
import { toCompactFormat } from "../../utils/compact";
import {MySQLPromisePool} from "@fastify/mysql";

interface WsQueryRequest {
  qid?: string | number;
  explain?: boolean;
  excludeMeta?: boolean;
  format?: "compact";
  query: string;
  params: Record<string, any>;
}

interface WsQueryResponse {
  qid?: string | number;
  explain?: boolean;
  error?: true;
  compact?: boolean;
  payload: any;
}

const root: FastifyPluginAsync = async (app, opts): Promise<void> => {
  await app.register(fastifyWebsocket, {
    path: '/socket.io',
    cors: {
      origin: (origin, cb) => {
        cb(null, origin)
      },
    },
    allowRequest: (req, done) => {
      const origin = req.headers.origin;
      // Allow empty origin
      if (!origin) {
        done(undefined, true);
        return;
      }
      const corsOrigin = getCorsOrigin(app, origin);
      if (corsOrigin) {
        done(undefined, true)
      } else {
        done('cors reject', false)
      }
    },
    transports: ['websocket'],
  });

  app.ready((err) => {
    if (err) throw err;

    app.io.on("connection", (socket) => {
      app.log.info("io connected");
      const log = app.log as pino.Logger;
      socketServerRoutes(log, socket, app.io, app.queryRunner, app.mysql);
      socket.on("disconnect", () => {
        app.log.info("io disconnected");
      });
    });
  });
};

function getCorsOrigin (app: FastifyInstance, origin: string | string[]): string | undefined {
  if (typeof origin === 'string') {
    let pass = false;
    for (let allowedOrigin of app.allowedOrigins) {
      if (typeof allowedOrigin === 'string') {
        if (allowedOrigin === origin) {
          pass = true;
          return origin;
        }
      } else {
        if (allowedOrigin.test(origin)) {
          pass = true;
          return origin;
        }
      }
    }
    // Only allow configured origins
    if (!pass) {
      return undefined;
    }
  }
}

export function socketServerRoutes(
  log: pino.Logger,
  socket: Socket,
  io: Server,
  queryRunner: QueryRunner,
  mysql: MySQLPromisePool
) {
  /*
   * This ws entrypoint provide a method to visit HTTP /q/:query and /q/explain/:query equally.
   * Client side should send a json message "{ qid?, explain, query, params }" to request a query.
   *
   * - Param `qid`: If `qid` exists, server will emit response into '/q/{query}?qid={qid}' topic. Otherwise,
   * server will emit response directly to '/q/{query}' which is reusable across different
   * subscribers.
   *
   * - Param `explain`: If `explain` is true, server will execute '/q/explain/{query}' instead, and to response topic
   * would be `/q/explain/{query}?qid={qid}`
   *
   * - Param `excludeMeta`: If `excludeMeta` is true, server will only return `data` field in response payload.
   *
   * - Param `format`: If `format` is compact, result will contain two parts: `fields` list and `data` array list.
   * Example:
   * ```json
   * {
   *    payload: {
   *      fields: ['field name 1', 'field name 2', ...],
   *      data: [['string field', <number>, ...], ...] },
   *    compact: true
   * }
   * ```
   *
   * - Error handling: If error occurs in Query.run phase, response.error would set to true, and payload
   * will be the error data.
   */
  socket.on("q", async (request: WsQueryRequest) => {
    try {
      const { explain, query, qid, params, format, excludeMeta } = request;
      const isCompact = format === "compact";
      const topic = `/q/${explain ? "explain/" : ""}${query}${
        qid ? `?qid=${qid}` : ""
      }`;
      let response: WsQueryResponse;

      try {
        let res;
        if (explain) {
          res = await queryRunner.explain(query, params);
        } else {
          res = await queryRunner.query(query, params);
        }

        if (isCompact) {
          res.data = toCompactFormat(res.data as any, res.fields);
        }

        if (excludeMeta) {
          res = {
            data: res.data,
            fields: isCompact ? res.fields : undefined,
          };
        }

        response = {
          qid: qid,
          explain: explain,
          payload: res,
          compact: explain ? undefined : isCompact,
        };
      } catch (e) {
        response = {
          error: true,
          qid: request.qid,
          explain: request.explain,
          payload: e,
        };
      }
      socket.emit(topic, response);
    } catch (error) {
      log.error("Failed to request %s[ws]: ", request, error);
      socket.emit("fatal-error/q", {
        request,
        error,
      });
    }
  });

  socket.on("close", () => {
    log.info("io disconnected");
  });
}

export default root;
