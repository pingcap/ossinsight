import {Pool} from "mysql2/promise";
import {pino} from "pino";
import CacheBuilder from "../../core/cache/CacheBuilder";
import fp from "fastify-plugin";

declare module 'fastify' {
    interface FastifyInstance {
        cacheBuilder: CacheBuilder;
    }
}

export default fp(async (app) => {
    const cacheBuilder = new CacheBuilder(
      app.log as pino.Logger,
      app.config.ENABLE_CACHE,
      app.mysql as unknown as Pool,
      app.mysql.shadow as unknown as Pool,
      app.config.QUERY_CACHE_KEY_PREFIX,
    );
    app.decorate('cacheBuilder', cacheBuilder);
}, {
    name: '@ossinsight/cache-builder',
    dependencies: [
        '@fastify/env',
        '@ossinsight/tidb',
    ],
});