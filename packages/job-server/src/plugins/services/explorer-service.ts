import {
    TiDBPlaygroundQueryExecutor,
    getPlaygroundSessionLimits, ExplorerService
} from "@ossinsight/api-server";
import fp from "fastify-plugin";

export default fp(async (app) => {
    const executor = new TiDBPlaygroundQueryExecutor({
        uri: app.config.PLAYGROUND_DATABASE_URL,
    }, getPlaygroundSessionLimits());
    app.decorate('explorerService', new ExplorerService(
      app.log.child({service: 'explorer-service'}),
      app.botService,
      executor
    ));
}, {
    name: '@ossinsight/explorer-service',
    dependencies: [
        '@fastify/env',
        '@ossinsight/queue',
        '@ossinsight/bot-service',
    ],
});
