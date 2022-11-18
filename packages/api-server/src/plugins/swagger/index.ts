import fp from "fastify-plugin";
import swagger from "@fastify/swagger";

export default fp(async (fastify) => {
    fastify.register(swagger, {
        swagger: {
            info: {
                title: 'OSSInsight API',
                description: 'OSSInsight API',
                version: '0.1.0'
            },
        }
    });
}, {
    name: 'swagger',
    dependencies: [
        '@fastify/env'
    ],
});