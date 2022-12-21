import {
    TiDBPlaygroundQueryExecutor, QueryExecutionService,
    getPlaygroundSessionLimits, PlaygroundService
} from "@ossinsight/api-server";
import fp from "fastify-plugin";

export default fp(async (app) => {
    const playgroundExecutor = new TiDBPlaygroundQueryExecutor({
        uri: app.config.PLAYGROUND_DATABASE_URL,
    }, getPlaygroundSessionLimits());
    const queryExecutionService = new QueryExecutionService();
    const { mysql, redis } = app;
    const playgroundService = new PlaygroundService(mysql, queryExecutionService, playgroundExecutor, redis);
    await app.decorate("playgroundService", playgroundService);
}, {
    name: '@ossinsight/playground-service',
    dependencies: [
        '@fastify/env',
    ],
});
