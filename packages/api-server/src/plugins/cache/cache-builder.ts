import CacheBuilder from "../../core/cache/CacheBuilder";
import { FastifyJWTOptions } from "@fastify/jwt";
import { FastifyOAuth2Options } from "@fastify/oauth2";
import fp from "fastify-plugin";
import pino from "pino";

declare module 'fastify' {
    interface FastifyInstance {
        cacheBuilder: CacheBuilder;
    }
}

export default fp<FastifyOAuth2Options & FastifyJWTOptions>(async (fastify) => {
    const log = fastify.log as pino.Logger;
    fastify.decorate('cacheBuilder', new CacheBuilder(log, fastify.config.ENABLE_CACHE));
}, {
    name: 'cache-builder',
    dependencies: [
        '@fastify/env'
    ],
});