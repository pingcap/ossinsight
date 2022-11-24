import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts/index";

const schema = {
    description: 'Get the authenticated user',
    tags: ['user'],
    response: {
        200: {
            type: 'object',
            description: 'OK',
            properties: {
                id: {
                    type: 'number',
                    description: 'The id of user'
                },
                name: {
                    type: 'string',
                    description: 'The name of user'
                },
                emailAddress: {
                    type: 'string',
                },
                emailGetUpdates: {
                    type: 'boolean',
                },
                githubId: {
                    type: 'number',
                },
                githubLogin: {
                    type: 'string',
                },
                avatarUrl: {
                    type: 'string',
                },
                createdAt: {
                    type: 'string'
                }
            }
        },
        404: {
            type: 'object',
            description: 'User not found'
        }
    }
};

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
    app.get('/', {
        preHandler: [app.authenticate],
        schema
    }, async function (req, reply) {
        const userId = req.user.id;
        const res = await app.userService.getUserById(userId);
        reply.send(res);
    });
}

export default root;
