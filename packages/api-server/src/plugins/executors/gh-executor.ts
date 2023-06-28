import GhExecutor from "../../core/executor/octokit-executor/GhExecutor";
import fp from "fastify-plugin";
import pino from "pino";

export default fp(async (app) => {
    const log = app.log as pino.Logger;
    app.decorate('ghExecutor', new GhExecutor(log, app.config.GITHUB_ACCESS_TOKENS, app.cacheBuilder));
}, {
    name: '@ossinsight/gh-executor',
    dependencies: [
        '@fastify/env',
        '@ossinsight/tidb',
        '@ossinsight/cache-builder'
    ],
});

declare module 'fastify' {
    interface FastifyInstance {
        ghExecutor: GhExecutor;
    }
}