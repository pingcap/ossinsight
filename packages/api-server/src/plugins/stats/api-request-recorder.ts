import fp from "fastify-plugin";
import {Pool} from "mysql2/promise";
import pino from "pino";
import {requestAuditContext} from '@ossinsight/types';

import {BatchLoader} from "../../core/db/batch-loader";
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
    const route = req.routeOptions.url || 'unmatched';
    // Query strings must not turn health/metrics checks into visitor statistics.
    if (route === '/metrics' || route === '/healthy') {
      done();
      return;
    }

    // Record the final response once, including errors and their final status.
    // This table is long-lived usage statistics, not the security-event log.
    // Keep its legacy columns compatible without copying visitor identifiers,
    // arbitrary URL segments or unreviewed query values into the database.
    const {resource, parameters} = requestAuditContext(route, req.raw.url);
    const isDev = process.env.NODE_ENV === 'development';
    void this.apiRequestRecorder.insert([
      '', '', req.method, boundedAuditText(resource, 255), JSON.stringify(parameters),
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
