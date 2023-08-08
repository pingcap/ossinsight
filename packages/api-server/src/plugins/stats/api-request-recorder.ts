import {FastifyRequest} from "fastify";
import fp from "fastify-plugin";
import {Pool} from "mysql2/promise";
import pino from "pino";
import { forwarded } from '@fastify/forwarded';
import {BatchLoader} from "../../core/db/batch-loader";
import Logger = pino.Logger;

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

    // Save the success request.
    const clientIP = getRealClientIP(req);
    const clientOrigin = req.headers.origin ?? '';
    const { method, query } = req;
    const { path } = req.urlData();
    const isDev = process.env.NODE_ENV === 'development';
    void this.apiRequestRecorder.insert([
      clientIP, clientOrigin, method, path, JSON.stringify(query), false, reply.statusCode, reply.getResponseTime(), isDev
    ]);
    done();
  });

  app.addHook('onError', function (req, reply, error, done) {
    // Save the failed request.
    const clientIP = getRealClientIP(req);
    const clientOrigin = req.headers.origin ?? '';
    const { method, query } = req;
    const { path } = req.urlData();
    const isDev = process.env.NODE_ENV === 'development';
    void this.apiRequestRecorder.insert([
      clientIP, clientOrigin, method, path, JSON.stringify(query), true, reply.statusCode, reply.getResponseTime(), isDev
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

/**
 * @summary Get client IP from request object.
 * @description Get the real client IP from the request.
 *
 * **Note**: By default, ELB appends the client's IP to the end of the `X-Forwarded-For` Header value, separated by commas. However,
 * when the `forwarded` module parses the `X-Forwarded-For` Header, it is stored in the addresses array in reverse order,so the
 * element with index 0 is the real client IP.
 *
 * **Reference**:
 * https://docs.aws.amazon.com/elasticloadbalancing/latest/application/x-forwarded-headers.html
 *
 * @param req The fastify request object.
 */
export function getRealClientIP(req: FastifyRequest): string {
  if (typeof req.headers['x-real-ip'] === 'string') {
    return req.headers['x-real-ip'];
  }

  const addresses = forwarded(req as any);
  return addresses[0] ?? req.ip;
}