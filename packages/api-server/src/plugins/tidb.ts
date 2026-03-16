import fp from "fastify-plugin";
import fastifyMySQL, {MySQLPromisePool} from "@fastify/mysql";
import {checkTiDBIfConnected, completeDatabaseURL} from "../utils/db";

/**
 * @ossinsight/tidb plugin
 *
 * This plugin is used to init TiDB and Shadow TiDB connection pool and managed them in Fastify instance.
 *
 * @usage
 *
 * If you want to use TiDB, you can use `app.tidb` to get the connection pool.
 *
 * ```ts
 * app.mysql.query(`SELECT 1`);
 * ```
 *
 * If you want to use Shadow TiDB, you can use `app.mysql.shadow` to get the connection pool.
 *
 * ```
 * app.mysql.shadow.query(`SELECT 1`);
 * ```
 *
 * @param app - Fastify instance.
 * @returns void
 */
export default fp(async (app) => {
    // Init TiDB.
    await app.register(fastifyMySQL, {
        promise: true,
        connectionString: completeDatabaseURL(app.config.DATABASE_URL)
    }).ready(async () => {
        await checkTiDBIfConnected(app.log, app.mysql, 'tidb');
    });

    // Init shadow TiDB.
    if (app.config.SHADOW_DATABASE_URL) {
        await app.register(fastifyMySQL, {
            name: 'shadow',
            promise: true,
            connectionString: completeDatabaseURL(app.config.SHADOW_DATABASE_URL)
        }).ready(async () => {
            await checkTiDBIfConnected(app.log, app.mysql.shadow, 'shadow');
        });
    }

    // Init playground TiDB.
    if (app.config.PLAYGROUND_DATABASE_URL) {
        await app.register(fastifyMySQL, {
            name: 'playground',
            promise: true,
            connectionString: completeDatabaseURL(app.config.PLAYGROUND_DATABASE_URL)
        }).ready(async () => {
            await checkTiDBIfConnected(app.log, app.mysql.playground, 'playground');
        });
    }

    // Init playground shadow TiDB.
    if (app.config.PLAYGROUND_SHADOW_DATABASE_URL) {
        await app.register(fastifyMySQL, {
            name: 'playgroundShadow',
            promise: true,
            connectionString: completeDatabaseURL(app.config.PLAYGROUND_SHADOW_DATABASE_URL)
        }).ready(async () => {
            await checkTiDBIfConnected(app.log, app.mysql.playgroundShadow, 'playground shadow');
        });
    }
}, {
    name: '@ossinsight/tidb',
    dependencies: [
        '@fastify/env'
    ]
});

declare module 'fastify' {
    interface FastifyInstance {
        mysql: MySQLPromisePool & {
            shadow?: MySQLPromisePool;
            playground?: MySQLPromisePool;
            playgroundShadow?: MySQLPromisePool;
        }
    }
}
