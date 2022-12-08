import { QueryLoader } from "../../../core/runner/query/QueryLoader";
import { QueryParser } from "../../../core/runner/query/QueryParser";
import { QueryRunner } from "../../../core/runner/query/QueryRunner";
import fp from "fastify-plugin";
import pino from "pino";

export default fp(async (app) => {
    const log = app.log as pino.Logger;
    const queryLoader = new QueryLoader(log);
    const queryParser = new QueryParser(app.collectionService);
    app.decorate('queryRunner', new QueryRunner(queryLoader, queryParser, app.cacheBuilder, app.tidbQueryExecutor));
}, {
    name: 'query-runner',
    dependencies: [
        '@fastify/env',
        'tidb-query-executor',
        'cache-builder',
        'collection-service'
    ],
});

declare module 'fastify' {
    interface FastifyInstance {
        queryRunner: QueryRunner;
    }
}