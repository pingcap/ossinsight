import fp from "fastify-plugin";
import fastifyMySQL from "@fastify/mysql";

export default fp(async (app) => {
    if (process.env.NODE_ENV === 'test' && (/tidb-cloud|gharchive_dev|github_events_api/.test(app.config.DATABASE_URL))) {
        throw new Error('Do not use online database in test env.');
    }
    await app.register(fastifyMySQL, {
        promise: true,
        connectionString: app.config.DATABASE_URL
    }).ready(async () => {
        try {
            await app.mysql.pool.query(`SELECT 1`);
            app.log.info('Connected to MySQL/TiDB database.');
        } catch(err) {
            app.log.error(err, 'Failed to connect to MySQL/TiDB database.');
        }
    });
}, {
    name: '@fastify/mysql',
    dependencies: [
        '@fastify/env'
    ]
});
