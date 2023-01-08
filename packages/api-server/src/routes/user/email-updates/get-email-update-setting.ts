import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts/index";

const schema = {
    description: 'Get email updates setting',
    tags: ['user'],
    response: {
        200: {
            type: 'object',
            description: 'OK',
            properties: {
                emailGetUpdates: {
                    type: 'boolean',
                }
            }
        }
    }
}

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
    app.get('/', {
        // @ts-ignore
        preValidation: app.authenticate,
        schema
    }, async function (req, reply) {
        const { sub } = req.user as {
          sub: string;
        };
        const userId = await app.userService.findOrCreateUserByAuth0Sub(sub, req.headers.authorization);
        const res = await app.userService.getEmailUpdates(userId);
        reply.send(res);
    });
}

export default root;
