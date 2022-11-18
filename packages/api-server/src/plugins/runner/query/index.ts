import CacheBuilder from "../../../core/cache/CacheBuilder";
import { QueryLoader } from "../../../core/runner/query/QueryLoader";
import { QueryParser } from "../../../core/runner/query/QueryParser";
import { QueryRunner } from "../../../core/runner/query/QueryRunner";
import fp from "fastify-plugin";
import pino from "pino";
import {createConnection} from "mysql2/promise";
import {getConnectionOptions} from "../../../utils/db";

export default fp(async (fastify) => {
    const log = fastify.log as pino.Logger;
    const queryLoader = new QueryLoader(log);
    const queryParser = new QueryParser(fastify.collectionService);
    const conn = await createConnection(getConnectionOptions());
    const cacheBuilder = new CacheBuilder(log, fastify.config.ENABLE_CACHE, conn);

    fastify.decorate('queryRunner', new QueryRunner(queryLoader, queryParser, cacheBuilder, fastify.tidbQueryExecutor));

}, {
    name: 'query-runner',
    dependencies: [
        '@fastify/env',
        'tidb-query-executor'
    ],
});

declare module 'fastify' {
    interface FastifyInstance {
        queryRunner: QueryRunner;
    }
}