import {FastifyPluginAsync} from "fastify";
import {getSuccessResponse, proxyGet} from "../../../../../utils/endpoint";

const schema = {
  operationId: 'list-repos-of-collection',
  summary: 'List collection repositories',
  method: 'GET',
  description: `List the repositories of collection.`,
  tags: ['Collections'],
  params: {
    type: 'object',
    required: ['collection_id'],
    properties: {
      collection_id: {
        type: 'number',
        description: 'The ID of collection'
      }
    }
  },
  response: {
    200: getSuccessResponse([
      {
        "col": "repo_id",
        "data_type": "BIGINT",
        "nullable": false
      },
      {
        "col": "repo_name",
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
            description: 'Repository ID'
          },
          repo_name: {
            type: 'string',
            description: 'Repository name'
          }
        },
        additionalProperties: true,
      },
      example: [
        {
          "repo_id": "507775",
          "repo_name": "elastic/elasticsearch"
        },
        {
          "repo_id": "41986369",
          "repo_name": "pingcap/tidb"
        },
        {
          "repo_id": "60246359",
          "repo_name": "clickhouse/clickhouse"
        },
        {
          "repo_id": "108110",
          "repo_name": "mongodb/mongo"
        },
        {
          "repo_id": "48833910",
          "repo_name": "tikv/tikv"
        }
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
