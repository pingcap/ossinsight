import { FastifyJWTOptions } from "@fastify/jwt";
import { FastifyOAuth2Options } from "@fastify/oauth2";
import GhExecutor from "../../core/executor/octokit-executor/GhExecutor";
import fp from "fastify-plugin";
import pino from "pino";

export default fp<FastifyOAuth2Options & FastifyJWTOptions>(async (fastify) => {
    const log = fastify.log as pino.Logger;
    fastify.decorate('ghExecutor', new GhExecutor(log, fastify.config.GITHUB_ACCESS_TOKENS, fastify.cacheBuilder));
}, {
    name: 'gh-executor',
    dependencies: [
        '@fastify/env',
        'cache-builder'
    ],
});

declare module 'fastify' {
    interface FastifyInstance {
        ghExecutor: GhExecutor;
    }
}