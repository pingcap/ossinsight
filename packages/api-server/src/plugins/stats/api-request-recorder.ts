import fp from "fastify-plugin";
import {Pool} from "mysql2/promise";
import pino from "pino";

import {BatchLoader} from "../../core/db/batch-loader";
import {getRealClientIP} from "../../utils/http/forwared";
import Logger = pino.Logger;

// Bound bytes as well as characters, without cutting a UTF-8 code point.
export function boundedAuditText(value: string, maximum: number): string {
  let result = '', bytes = 0;
  for (const character of value) {
    const size = Buffer.byteLength(character);
    if (bytes + size > maximum) break;
    result += character; bytes += size;
  }
  return result;
}

declare module 'fastify' {
  interface FastifyInstance {
    apiRequestRecorder: BatchLoader;
  }
}

export default fp(async (app) => {
  // Init API Request Stats Batch Loader.
  const insertSQL = `INSERT INTO stats_api_requests(client_ip, client_origin, method, path, query, error, status_code, duration, is_dev) VALUES ?`;
  const apiRequestRecorder = new BatchLoader(app.log as Logger, app.mysql as unknown as Pool, insertSQL);

  app.decorate('apiRequestRecorder', apiRequestRecorder);
  app.addHook('onResponse', function (req, reply, done) {
    // Skip metrics request.
    if (req.url === '/metrics' || req.url === '/healthy') {
      done();
      return;
    }

    // Record the final response once, including errors and their final status.
    const clientIP = boundedAuditText(getRealClientIP(req), 128);
    const clientOrigin = boundedAuditText(req.headers.origin ?? '', 255);
    const { method, query } = req;
    const { path } = req.urlData();
    const isDev = process.env.NODE_ENV === 'development';
    void this.apiRequestRecorder.insert([
      clientIP, clientOrigin, method, boundedAuditText(path ?? '', 255), JSON.stringify(query),
      reply.statusCode >= 400, reply.statusCode, reply.elapsedTime, isDev
    ]);
    done();
  });

  app.addHook('onClose',  async function (app) {
    await apiRequestRecorder.destroy();
  });

}, {
  name: '@ossinsight/api-request-recorder',
  dependencies: [
    '@fastify/env',
    '@ossinsight/tidb'
  ],
});
