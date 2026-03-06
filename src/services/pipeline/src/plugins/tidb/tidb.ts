import fp from "fastify-plugin";
import fastifyMySQL, {MySQLPromisePool} from "@fastify/mysql";
import {checkTiDBIfConnected, completeDatabaseURL} from "../../utils/db";

declare module 'fastify' {
    interface FastifyInstance {
        mysql: MySQLPromisePool;
    }
}

export default fp(async (app) => {
    await app.register(fastifyMySQL, {
        promise: true,
        connectionString: completeDatabaseURL(app.config.DATABASE_URL)
    }).ready(async () => {
        await checkTiDBIfConnected(app.log, app.mysql, 'tidb');
    });
}, {
    name: '@ossinsight/tidb',
    dependencies: [
        '@fastify/env'
    ]
});

