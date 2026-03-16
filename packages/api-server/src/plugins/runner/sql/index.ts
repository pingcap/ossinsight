import { SQLRunner } from "../../../core/runner/sql/SQLRunner";
import fp from "fastify-plugin";

// Should be playground query executor.
export default fp(async (fastify) => {
    fastify.decorate('sqlRunner', new SQLRunner(fastify.playgroundQueryExecutor));
}, {
    name: '@ossinsight/sql-runner',
    dependencies: [
        '@fastify/env',
        '@ossinsight/playground-query-executor'
    ],
});

declare module 'fastify' {
    interface FastifyInstance {
        sqlRunner: SQLRunner;
    }
}