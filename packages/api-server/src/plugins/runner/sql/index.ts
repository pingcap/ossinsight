import { SQLRunner } from "../../../core/runner/sql/SQLRunner";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
    fastify.decorate('sqlRunner', new SQLRunner(fastify.playgroundQueryExecutor));
}, {
    name: 'sql-runner',
    dependencies: [
        '@fastify/env',
        'playground-query-executor'
    ],
});

declare module 'fastify' {
    interface FastifyInstance {
        sqlRunner: SQLRunner;
    }
}