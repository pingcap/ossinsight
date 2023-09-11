import {FastifyPluginAsync} from "fastify";
import {getSuccessResponse, proxyGet} from "../../../../utils/endpoint";

const schema = {
  operationId: 'list-hot-collection',
  summary: 'List hot collection',
  method: 'GET',
  description: `List hot collection.`,
  tags: ['Collections'],
  querystring: {
    type: 'object',
    required: ['period'],
    properties: {
      period: {
        type: 'string',
        description: 'The period of the range.',
        enum: ['past_28_days', 'past_month'],
        default: 'past_28_days'
      }
    }
  },
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
      },
      {
        "col": "visits",
        "data_type": "BIGINT",
        "nullable": false
      },
      {
        "col": "repo_id",
        "data_type": "BIGINT",
        "nullable": false
      },
      {
        "col": "repo_name",
        "data_type": "VARCHAR",
        "nullable": false
      },
      {
        "col": "rank",
        "data_type": "BIGINT",
        "nullable": true
      },
      {
        "col": "last_month_rank",
        "data_type": "INT",
        "nullable": true
      },
      {
        "col": "last_2nd_month_rank",
        "data_type": "INT",
        "nullable": true
      },
      {
        "col": "rank_changes",
        "data_type": "BIGINT",
        "nullable": true
      },
      {
        "col": "repos",
        "data_type": "BIGINT",
        "nullable": false
      }
    ], {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Collection ID'
          },
          name: {
            type: 'string',
            description: 'Collection name'
          },
          visits: {
            type: 'string',
            description: 'Number of visits'
          },
          repo_id: {
            type: 'string',
            description: 'Repository ID'
          },
          repo_name: {
            type: 'string',
            description: 'Repository name'
          },
          rank: {
            type: 'string',
            description: 'The rank of the repository in the collection'
          }
        },
        additionalProperties: true,
      },
      example: [
        {
          "id": "10010",
          "last_2nd_month_rank": "4",
          "last_month_rank": "3",
          "name": "Artificial Intelligence",
          "rank": "3",
          "rank_changes": "1",
          "repo_id": "65600975",
          "repo_name": "pytorch/pytorch",
          "repos": "36",
          "visits": "20100"
        },
        {
          "id": "10010",
          "last_2nd_month_rank": "1",
          "last_month_rank": "1",
          "name": "Artificial Intelligence",
          "rank": "1",
          "rank_changes": "0",
          "repo_id": "155220641",
          "repo_name": "huggingface/transformers",
          "repos": "36",
          "visits": "20100"
        },
        {
          "id": "10010",
          "last_2nd_month_rank": "2",
          "last_month_rank": "2",
          "name": "Artificial Intelligence",
          "rank": "2",
          "rank_changes": "0",
          "repo_id": "458588993",
          "repo_name": "nebuly-ai/nebullvm",
          "repos": "36",
          "visits": "20100"
        },
        {
          "id": "10078",
          "last_2nd_month_rank": "",
          "last_month_rank": "1",
          "name": "ChatGPT Apps",
          "rank": "1",
          "rank_changes": "",
          "repo_id": "608555244",
          "repo_name": "microsoft/visual-chatgpt",
          "repos": "36",
          "visits": "2723"
        },
        {
          "id": "10078",
          "last_2nd_month_rank": "6",
          "last_month_rank": "3",
          "name": "ChatGPT Apps",
          "rank": "3",
          "rank_changes": "3",
          "repo_id": "599394820",
          "repo_name": "Chanzhaoyu/chatgpt-web",
          "repos": "36",
          "visits": "2723"
        },
        {
          "id": "10078",
          "last_2nd_month_rank": "",
          "last_month_rank": "2",
          "name": "ChatGPT Apps",
          "rank": "2",
          "rank_changes": "",
          "repo_id": "609416865",
          "repo_name": "yetone/openai-translator",
          "repos": "36",
          "visits": "2723"
        }
      ]
    }, {
      row_count: 6
    }),
  }
};

const queryHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  proxyGet(app, opts, schema);
}

export default queryHandler;
