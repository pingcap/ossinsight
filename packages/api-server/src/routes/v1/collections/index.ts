import {FastifyPluginAsync} from "fastify";
import {getSuccessResponse, proxyGet} from "../../../utils/endpoint";

const schema = {
  operationId: 'list-collections',
  summary: 'List collections',
  method: 'GET',
  description: `List collections.`,
  tags: ['Collections'],
  params: {},
  response: {
    200: getSuccessResponse([
      {
        "col": "id",
        "data_type": "BIGINT",
        "nullable": false
      },
      {
        "col": "name",
        "data_type": "VARCHAR",
        "nullable": false
      }
    ], {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          repo_id: {
            type: 'string',
            description: 'Collection ID'
          },
          repo_name: {
            type: 'string',
            description: 'Collection name'
          }
        },
        additionalProperties: true,
      },
      example: [
        {
          "id": "1",
          "name": "Static Site Generator"
        },
        {
          "id": "2",
          "name": "Open Source Database"
        },
        {
          "id": "10001",
          "name": "CSS Framework"
        },
        {
          "id": "10002",
          "name": "Google Analytics Alternative"
        },
        {
          "id": "10003",
          "name": "Low Code Development Tool"
        },
      ]
    }, {
      row_count: 5
    }),
  }
};

const queryHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  proxyGet(app, opts, schema);
}

export default queryHandler;
