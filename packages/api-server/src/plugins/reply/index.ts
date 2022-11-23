import fp from "fastify-plugin";

declare module 'fastify' {
    interface FastifyReply {
        sendSuccess: (data?: any) => void;
    }
}

export default fp(async (app) => {
    app.decorateReply('sendSuccess', function (data?: any) {
        this.send({
            success: true,
            data: data
        });
    });
});