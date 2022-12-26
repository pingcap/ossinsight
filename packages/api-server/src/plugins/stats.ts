import fp from "fastify-plugin";
import {BatchLoader} from "../core/db/batch-loader";
import {getPool} from "../core/db/new";

declare module 'fastify' {
    interface FastifyInstance {
        accessRecorder: BatchLoader;
    }
}

export default fp(async (app) => {
    // Init Access Log Batch Loader.
    const pool = getPool({
        uri: app.config.DATABASE_URL,
        connectionLimit: 2
    });
    const insertAccessLogSQL = `INSERT INTO access_logs(
      remote_addr, origin, status_code, request_path, request_params
    ) VALUES ?`;
    const accessRecorder = new BatchLoader(pool, insertAccessLogSQL);

    app.decorate('accessRecorder', accessRecorder);

    app.addHook('onResponse', function (request, reply, done) {
        if (/\/login\/.+/.test(request.url)) {
            done();
            return;
        }

        void this.accessRecorder.insert([
            request.ip, request.headers.origin ?? '', reply.statusCode, request.url, JSON.stringify(request.query)
        ]);
        done();
    });

    app.addHook('onError', function (request, reply, error, done) {
        void this.accessRecorder.insert([
            request.ip, request.headers.origin ?? '', reply.statusCode, request.url, JSON.stringify(request.query)
        ]);
        done();
    });

    app.addHook('onClose',  async function (app) {
        await accessRecorder.destroy();
        await pool.end();
    });

}, {
    name: 'access-recorder',
    dependencies: [
        '@fastify/env'
    ],
});
