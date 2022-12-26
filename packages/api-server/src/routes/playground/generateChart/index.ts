import { FastifyPluginAsync } from 'fastify';
import {GenerateChartPromptTemplate} from "../../../plugins/services/bot-service/template/GenerateChartPromptTemplate";

export const schema = {
  description: 'Generate Chart',
  summary: 'Generate Chart according to the given data',
  tags: ['playground'],
  body: {
    type: 'object',
    required: ['data'],
    properties: {
      data: {
        description: 'The data to generate chart',
      }
    }
  }
};

export interface IBody {
  data: any;
}

const root: FastifyPluginAsync = async (app) => {
  const generateChartPrompt = new GenerateChartPromptTemplate();
  app.post<{
    Body: IBody
  }>('/', {
    schema,
  },async (req, reply) => {
    const { data } = req.body;
    const res = await app.botService.dataToChart(generateChartPrompt, data);
    reply.status(200).send(res);
  });
};

export default root;
