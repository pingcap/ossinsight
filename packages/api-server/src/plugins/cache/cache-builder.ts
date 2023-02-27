import CacheBuilder from "../../core/cache/CacheBuilder";
import fp from "fastify-plugin";
import pino from "pino";
import {ConnectionWrapper} from "../../core/db/connection-wrapper";

declare module 'fastify' {
    interface FastifyInstance {
        cacheBuilder: CacheBuilder;
    }
}

export default fp(async (fastify) => {
    const log = fastify.log as pino.Logger;
    const wrapper = await ConnectionWrapper.new({
        uri: fastify.config.DATABASE_URL
    });
    let shadowWrapper: ConnectionWrapper | undefined;
    if (fastify.config.SHADOW_DATABASE_URL) {
        shadowWrapper = await ConnectionWrapper.new({
            uri: fastify.config.SHADOW_DATABASE_URL
        });
    }
    fastify.decorate('cacheBuilder', new CacheBuilder(log, fastify.config.ENABLE_CACHE, wrapper, shadowWrapper));
}, {
    name: 'cache-builder',
    dependencies: [
        '@fastify/env'
    ],
});