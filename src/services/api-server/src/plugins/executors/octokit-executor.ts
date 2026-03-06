import OctokitExecutor from "../../core/executor/octokit-executor/OctokitExecutor";
import fp from "fastify-plugin";
import pino from "pino";

declare module 'fastify' {
    interface FastifyInstance {
        octokitExecutor: OctokitExecutor;
    }
}

export default fp(async (app) => {
    const log = app.log as pino.Logger;
    app.decorate('octokitExecutor', new OctokitExecutor(log, app.config.GITHUB_ACCESS_TOKENS));
}, {
    name: '@ossinsight/octokit-executor',
    dependencies: [
        '@fastify/env'
    ],
});
