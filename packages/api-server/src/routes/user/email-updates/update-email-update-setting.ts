import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts/index";
import { Auth0User, parseAuth0User } from "../../../plugins/services/user-service/auth0";

export interface IBody {
    enable: boolean;
}

const schema = {
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
            properties: {
                emailGetUpdates: {
                    type: 'boolean',
                }
            }
        }
    }
}

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
    // FIXME: schema to ts type will not work when setting preHandler.
    app.put<{
        Body: IBody;
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
        const enable = req.body.enable;
        await app.userService.settingEmailUpdates(userId, enable);
        const setting = await app.userService.getEmailUpdates(userId);
        reply.send(setting);
    });
}

export default root;
