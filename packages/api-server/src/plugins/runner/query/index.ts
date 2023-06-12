import { QueryLoader } from "../../../core/runner/query/QueryLoader";
import { QueryParser } from "../../../core/runner/query/QueryParser";
import { QueryRunner } from "../../../core/runner/query/QueryRunner";
import fp from "fastify-plugin";
import pino from "pino";

export default fp(async (app: any) => {
    const log = app.log as pino.Logger;
    const queryLoader = new QueryLoader(log);
    const queryParser = new QueryParser();
    app.decorate('queryRunner', new QueryRunner(queryLoader, queryParser, app.cacheBuilder, app.tidbQueryExecutor));
}, {
    name: '@ossinsight/query-runner',
    dependencies: [
        '@fastify/env',
        '@ossinsight/tidb-query-executor',
        '@ossinsight/cache-builder',
        '@ossinsight/collection-service'
    ],
});

declare module 'fastify' {
    interface FastifyInstance {
        queryRunner: QueryRunner;
    }
}