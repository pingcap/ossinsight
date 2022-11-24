import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts/index";
import {IParams, params} from "../subscribe";

const schema = {
    description: 'Unsubscribe the repository updates',
    params
};

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
    app.put<{
        Params: IParams;
    }>('/', {
        preHandler: [app.authenticate],
        schema
    }, async function (req, reply) {
        const userId = req.user.id;
        const { owner, repo } = req.params;
        await app.repoService.unsubscribeRepo(userId, owner, repo);
        reply.send();
    })
}

export default root;
