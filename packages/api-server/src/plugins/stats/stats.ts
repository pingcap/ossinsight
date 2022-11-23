import fp from "fastify-plugin";
import {createPool} from "mysql2/promise";
import {BatchLoader} from "../../core/db/BatchLoader";
import {getConnectionOptions} from "../../utils/db";

declare module 'fastify' {
    interface FastifyInstance {
        accessRecorder: BatchLoader;
    }
}

export default fp(async (app) => {
    // Init Access Log Batch Loader.
    const pool = createPool(getConnectionOptions({
        connectionLimit: 2
    }));
    const insertAccessLogSQL = `INSERT INTO access_logs(
      remote_addr, origin, status_code, request_path, request_params
    ) VALUES ?`;
    const accessRecorder = new BatchLoader(pool, insertAccessLogSQL);
    app.decorate('accessRecorder', accessRecorder);

    app.addHook('onResponse', function (request, reply, done) {
        void this.accessRecorder.insert([
            request.ip, request.headers.origin ?? '', reply.statusCode, request.url, JSON.stringify(request.query)
        ]);
        done();
    });

    app.addHook('onError', function (request, reply, error) {
        void this.accessRecorder.insert([
            request.ip, request.headers.origin ?? '', reply.statusCode, request.url, JSON.stringify(request.query)
        ]);
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
