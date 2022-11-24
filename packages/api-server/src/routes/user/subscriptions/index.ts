import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts/index";

const schema = {
    description: 'Get email updates setting',
    tags: ['user'],
    response: {
        200: {
            type: 'array',
            description: 'OK',
            items: {
                type: 'object',
                properties: {
                    userId: {
                        type: 'number',
                    },
                    repoId: {
                        type: 'number',
                    },
                    repoName: {
                        type: 'string',
                    },
                    subscribed: {
                        type: 'number',
                    },
                    subscribedAt: {
                        type: 'string',
                    }
                }
            }
        }
    }
}

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
    app.get('/', {
        preHandler: [app.authenticate],
        schema
    }, async function (req, reply) {
        const userId = req.user.id;
        const res = await app.repoService.getUserSubscribedRepos(userId);
        reply.send(res);
    });
}

export default root;
