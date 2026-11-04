import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {withConnection} from "../../../../../utils/db";
import {authenticateQuestionReader, getReadableQuestion, questionIdSchema} from '../../../../../utils/explorer-access';

const getQuestionTagsSchema = {
  summary: 'Get tags of question',
  tags: ['explorer'],
  params: {
    type: 'object',
    required: ['questionId'],
    properties: {
      questionId: questionIdSchema
    }
  }
};

const setQuestionTagsSchema = {
  summary: 'Set tags for question',
  tags: ['explorer'],
  params: {
    type: "object",
    properties: {
      questionId: questionIdSchema
    }
  },
  body: {
    type: 'object',
    properties: {
      tagIds: { type: 'array', maxItems: 100, items: { type: 'integer', minimum: 1 } }
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
    schema: getQuestionTagsSchema,
    preValidation: authenticateQuestionReader(app),
  }, async function (req, reply) {
    const { questionId } = req.params;
    await getReadableQuestion(app, req, questionId);
    const questionTags = await withConnection(this.mysql, async (conn) => {
      return await app.explorerService.getQuestionTags(conn, questionId);
    });
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
    const userId = await app.userService.getUserIdOrCreate(req);
    await app.explorerService.checkIfTrustedUsersOrError(userId);

    // Set tags.
    await app.explorerService.updateQuestionTags(questionId, tagIds, {userId, requestId: req.id});

    reply.status(200).send({
      message: "OK"
    });
  });
}

export default questionTagsHandler;
