import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {Auth0User, parseAuth0User} from "../../../../../plugins/auth/auth0";

const getQuestionTagsSchema = {
  summary: 'Get tags of question',
  tags: ['explorer'],
  params: {
    type: 'object',
    properties: {
      questionId: { type: 'string' }
    }
  }
};

const setQuestionTagsSchema = {
  summary: 'Set tags for question',
  tags: ['explorer'],
  params: {
    type: "object",
    properties: {
      questionId: { type: 'string' }
    }
  },
  body: {
    type: 'object',
    properties: {
      tagIds: { type: 'array', items: { type: 'number' } }
    }
  }
};

export interface getTagsParams {
  questionId: string;
}

export interface setTagsParams {
  questionId: string;
}

export interface setTagsBody {
  tagIds: number[];
}

export const questionTagsHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.get<{
    Params: getTagsParams;
  }>('/', {
    schema: getQuestionTagsSchema
  }, async function (req, reply) {
    const { questionId } = req.params;
    const questionTags = await app.explorerService.getQuestionTags(questionId);
    reply.status(200).send(questionTags);
  });

  app.post<{
    Params: setTagsParams;
    Body: setTagsBody;
  }>('/', {
    schema: setQuestionTagsSchema,
    preValidation: app.authenticate
  }, async function (req, reply) {
    const { questionId } = req.params;
    const { tagIds = [] } = req.body;

    // Only trusted users can set tags.
    const { sub, metadata } = parseAuth0User(req.user as Auth0User);
    const userId = await app.userService.findOrCreateUserByAccount(
      { ...metadata, sub },
      req.headers.authorization
    );
    await app.explorerService.checkIfTrustedUsersOrError(userId);

    // Set tags.
    await app.explorerService.setQuestionTags(questionId, tagIds);
    reply.status(200).send({
      message: "OK"
    });
  });
}

export default questionTagsHandler;
