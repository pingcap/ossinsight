import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts/index";
import {IParams, params} from "../subscribe";
import { Auth0User, parseAuth0User } from "../../../../../plugins/services/user-service/auth0";

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
        const { sub, metadata } = parseAuth0User(req.user as Auth0User);
        const userId = await app.userService.findOrCreateUserByAccount(
          { ...metadata, sub },
          req.headers.authorization
        );
        const { owner, repo } = req.params;
        await app.repoService.unsubscribeRepo(userId, owner, repo);
        reply.send();
    })
}

export default root;
