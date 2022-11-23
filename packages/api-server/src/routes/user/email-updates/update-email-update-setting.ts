import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts/index";

export interface IBody {
    enable: boolean;
}

const settingEmailUpdatesSchema = {
    description: 'Update email updates setting',
    tags: ['user'],
    body: {
        type: 'object',
        required: ['enable'],
        properties: {
            enable: {
                type: 'boolean',
                description: 'Enable email updates'
            }
        }
    },
    response: {
        200: {
            type: 'object',
            description: 'OK',
        }
    }
}

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
    // FIXME: schema to ts type will not work when setting preHandler.
    app.put<{
        Body: IBody;
    }>('/', {
        preHandler: [app.authenticate],
        schema: settingEmailUpdatesSchema
    }, async function (req, reply) {
        const userId = req.user.userId;
        const enable = req.body.enable;
        await app.userService.settingEmailUpdates(userId, enable);
        reply.sendSuccess();
    });
}

export default root;
