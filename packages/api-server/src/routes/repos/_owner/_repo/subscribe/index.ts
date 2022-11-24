import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

export interface IParams {
    owner: string;
    repo: string;
}

export const params = {
    type: 'object',
    required: ['owner', 'repo'],
    properties: {
        owner: {
            type: 'string',
            description: 'The login of the repository\'s owner, for example, `pingcap` is the `owner` part of `pingcap/tidb` repository.'
        },
        repo: {
            type: 'string',
            description: 'The repo name of the repository, for example, `tidb` is the `repo` part of `pingcap/tidb` repository.'
        },
    }
} as const;

const schema = {
    description: 'Subscribe the repository updates',
    params
};

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
    app.put<{
        Params: IParams;
    }>('/', {
        preHandler: [app.authenticate],
        schema: schema
    }, async function (req, reply) {
        const userId = req.user.id;
        const { owner, repo } = req.params;
        await app.repoService.subscribeRepo(userId, owner, repo);
        reply.send();
    })
}

export default root;
