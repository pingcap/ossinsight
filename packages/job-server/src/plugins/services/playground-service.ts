import {
    TiDBPlaygroundQueryExecutor,
    getPlaygroundSessionLimits, PlaygroundService
} from "@ossinsight/api-server";
import fp from "fastify-plugin";

export default fp(async (app) => {
    const playgroundExecutor = new TiDBPlaygroundQueryExecutor({
        uri: app.config.PLAYGROUND_DATABASE_URL,
    }, getPlaygroundSessionLimits());
    const playgroundService = new PlaygroundService(app.mysql, app.queryExecutionService, playgroundExecutor, app.queues.playground);
    await app.decorate("playgroundService", playgroundService);
}, {
    name: '@ossinsight/playground-service',
    dependencies: [
        '@fastify/env',
        '@ossinsight/queue',
        '@ossinsight/query-execution-service'
    ],
});
