import {
    TiDBPlaygroundQueryExecutor,
    getPlaygroundSessionLimits, ExplorerService
} from "@ossinsight/api-server";
import fp from "fastify-plugin";
import {ConnectionOptions} from "mysql2";

export default fp(async (app) => {
    const dbOptions = {
        uri: app.config.PLAYGROUND_DATABASE_URL,
    };

    let shadowDbOptions: ConnectionOptions | null = null;
    if (app.config.PLAYGROUND_SHADOW_DATABASE_URL) {
        shadowDbOptions = {
            uri: app.config.PLAYGROUND_SHADOW_DATABASE_URL,
        }
    }

    const executor = new TiDBPlaygroundQueryExecutor(dbOptions, shadowDbOptions, getPlaygroundSessionLimits());
    app.decorate('explorerService', new ExplorerService(
      app.log.child({service: 'explorer-service'}),
      app.mysql,
      app.botService,
      executor,
      app.queues.explorer_low_concurrent_queue,
      app.queues.explorer_high_concurrent_queue,
      {
        querySQLTimeout: app.config.EXPLORER_QUERY_SQL_TIMEOUT,
      }
    ));
}, {
    name: '@ossinsight/explorer-service',
    dependencies: [
        '@fastify/env',
        '@ossinsight/queue',
        '@ossinsight/bot-service',
    ],
});
