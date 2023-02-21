import { TiDBQueryExecutor } from "../../core/executor/query-executor/TiDBQueryExecutor";
import fp from "fastify-plugin";

export default fp(async (app) => {
    app.decorate('tidbQueryExecutor', new TiDBQueryExecutor({
        uri: app.config.DATABASE_URL
    }, true));
}, {
    name: 'tidb-query-executor'
});

declare module 'fastify' {
    interface FastifyInstance {
        tidbQueryExecutor: TiDBQueryExecutor;
    }
}