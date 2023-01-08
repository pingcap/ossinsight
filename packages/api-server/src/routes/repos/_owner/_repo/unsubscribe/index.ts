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
        // @ts-ignore
        preValidation: app.authenticate,
        schema
    }, async function (req, reply) {
        const { sub } = req.user as {
          sub: string;
        };
        const userId = await app.userService.findOrCreateUserByAuth0Sub(sub, req.headers.authorization);
        const { owner, repo } = req.params;
        await app.repoService.unsubscribeRepo(userId, owner, repo);
        reply.send();
    })
}

export default root;
