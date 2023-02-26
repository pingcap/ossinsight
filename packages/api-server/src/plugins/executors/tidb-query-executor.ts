import { TiDBQueryExecutor } from "../../core/executor/query-executor/TiDBQueryExecutor";
import fp from "fastify-plugin";

export default fp(async (app) => {
    app.decorate('tidbQueryExecutor', new TiDBQueryExecutor({
        uri: app.config.DATABASE_URL
    }, true, !!app.config.SHADOW_DATABASE_URL ? {
        uri: app.config.SHADOW_DATABASE_URL
    } : null));
}, {
    name: 'tidb-query-executor'
});

declare module 'fastify' {
    interface FastifyInstance {
        tidbQueryExecutor: TiDBQueryExecutor;
    }
}