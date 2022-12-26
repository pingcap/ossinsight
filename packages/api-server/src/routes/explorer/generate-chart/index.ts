import { FastifyPluginAsync } from 'fastify';
import {GenerateChartPromptTemplate} from "../../../plugins/services/bot-service/template/GenerateChartPromptTemplate";

export const schema = {
  summary: 'Generate Chart',
  description: 'Generate Chart according to the given data',
  tags: ['explorer'],
  body: {
    type: 'object',
    required: ['data'],
    properties: {
      question: {
        description: 'The question to generate chart',
      },
      data: {
        description: 'The data to generate chart',
      }
    }
  }
};

export interface IBody {
  question: string;
  data: any;
}

const root: FastifyPluginAsync = async (app) => {
  const generateChartPrompt = new GenerateChartPromptTemplate();
  app.post<{
    Body: IBody
  }>('/', {
    schema,
    preHandler: [app.authenticate]
  },async (req, reply) => {
    const { question, data } = req.body;
    const res = await app.botService.dataToChart(generateChartPrompt, question, data);
    reply.status(200).send(res);
  });
};

export default root;
