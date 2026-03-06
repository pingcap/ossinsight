import {QueryLoader} from "../../../core/runner/query/QueryLoader";
import { QueryRunner } from "../../../core/runner/query/QueryRunner";
import fp from "fastify-plugin";
import pino from "pino";

export default fp(async (app: any) => {
    const log = app.log as pino.Logger;
    const queryLoader = new QueryLoader(log);
    app.decorate('queryRunner', new QueryRunner(log, app.cacheBuilder, queryLoader, app.tidbQueryExecutor, app.mysql));
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