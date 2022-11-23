import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts/index";

const schema = {
    description: 'Get email updates setting',
    tags: ['user'],
    response: {
        200: {
            type: 'object',
            description: 'OK',
        }
    }
}

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
    app.get('/', { schema }, async function (req, reply) {
        const userId = req.user.userId;
        const res = await app.userService.getEmailUpdates(userId);
        reply.sendSuccess(res);
    });
}

export default root;
