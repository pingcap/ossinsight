import fp from "fastify-plugin";
import fastifyMySQL from "@fastify/mysql";

export default fp(async (app) => {
    await app
        .register(fastifyMySQL, {
            promise: true,
            connectionString: app.config.DATABASE_URL
        })
        .ready(async () => {
            try {
                await app.mysql.pool.query('SELECT 1');
                app.log.info('Connected to MySQL/TiDB database.');
            } catch (err) {
                app.log.error(err, 'Failed to connect to MySQL/TiDB database.');
            }
        });
}, {
    name: 'db-pool',
    dependencies: [
        '@fastify/env',
    ],
});
