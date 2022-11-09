import { SQLRunner } from "../../../core/runner/sql/SQLRunner";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
    fastify.decorate('sqlRunner', new SQLRunner(fastify.tidbQueryExecutor));
}, {
    name: 'sql-runner',
    dependencies: [
        '@fastify/env',
        'tidb-query-executor'
    ],
});

declare module 'fastify' {
    interface FastifyInstance {
        sqlRunner: SQLRunner;
    }
}