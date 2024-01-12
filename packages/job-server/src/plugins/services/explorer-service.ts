
import {ExplorerService, getPlaygroundSessionLimits, TiDBPlaygroundQueryExecutor} from "@ossinsight/api-server";
import fp from "fastify-plugin";
import {Pool} from "mysql2/promise";
import pino from "pino";
import Logger = pino.Logger;

export default fp(async (app) => {
    const log = app.log as unknown as Logger;
    const playgroundPool = app.mysql.playground as unknown as Pool;
    const playgroundShadowPool = app.mysql.playgroundShadow as unknown as Pool;
    const executor = new TiDBPlaygroundQueryExecutor(playgroundPool, playgroundShadowPool, log, getPlaygroundSessionLimits());
    app.decorate('explorerService', new ExplorerService(
      app.log.child({module: 'explorer-service'}),
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
