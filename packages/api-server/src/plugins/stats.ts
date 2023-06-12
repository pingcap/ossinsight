import fp from "fastify-plugin";
import {Pool} from "mysql2/promise";
import pino from "pino";
import {BatchLoader} from "../core/db/batch-loader";
import Logger = pino.Logger;

declare module 'fastify' {
  interface FastifyInstance {
    accessRecorder: BatchLoader;
  }
}

export default fp(async (app) => {
  // Init Access Log Batch Loader.
  const insertAccessLogSQL = `INSERT INTO access_logs(
      remote_addr, origin, status_code, request_path, request_params
  ) VALUES ?`;
  const accessRecorder = new BatchLoader(app.log as Logger, app.mysql as unknown as Pool, insertAccessLogSQL);

  app.decorate('accessRecorder', accessRecorder);

  app.addHook('onResponse', function (request, reply, done) {
    if (/\/login\/.+/.test(request.url)) {
      done();
      return;
    }

    const ip = request.headers['x-real-ip'] ?? request.ip;
    const origin = request.headers.origin ?? '';
    void this.accessRecorder.insert([
      ip, origin, reply.statusCode, request.url, JSON.stringify(request.query)
    ]);
    done();
  });

  app.addHook('onError', function (request, reply, error, done) {
    const ip = request.headers['x-real-ip'] ?? request.ip;
    const origin = request.headers.origin ?? '';
    void this.accessRecorder.insert([
      ip, origin, reply.statusCode, request.url, JSON.stringify(request.query)
    ]);
    done();
  });

  app.addHook('onClose',  async function (app) {
    await accessRecorder.destroy();
  });

}, {
  name: '@ossinsight/access-recorder',
  dependencies: [
    '@fastify/env',
    '@ossinsight/tidb'
  ],
});
