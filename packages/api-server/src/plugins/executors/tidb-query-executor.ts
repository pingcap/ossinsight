import { FastifyJWTOptions } from "@fastify/jwt";
import { FastifyOAuth2Options } from "@fastify/oauth2";
import { TiDBQueryExecutor } from "../../core/executor/query-executor/TiDBQueryExecutor";
import fp from "fastify-plugin";
import { getConnectionOptions } from "../../utils/db";

export default fp<FastifyOAuth2Options & FastifyJWTOptions>(async (fastify) => {
    fastify.decorate('tidbQueryExecutor', new TiDBQueryExecutor(getConnectionOptions({
        queueLimit: fastify.config.QUEUE_LIMIT,
        connectionLimit: fastify.config.CONNECTION_LIMIT,
    }), true));
}, {
    name: 'tidb-query-executor'
});

declare module 'fastify' {
    interface FastifyInstance {
        tidbQueryExecutor: TiDBQueryExecutor;
    }
}