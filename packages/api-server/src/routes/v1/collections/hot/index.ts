import {FastifyPluginAsync} from "fastify";
import {getSuccessResponse, proxyGet} from "../../../../utils/endpoint";

const schema = {
  operationId: 'list-hot-collections',
  summary: 'List hot collections',
  method: 'GET',
  description: `List hot collections with top repositories of the collection.`,
  tags: ['Collections'],
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
        "col": "repos",
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
        "col": "repo_current_period_rank",
        "data_type": "INT",
        "nullable": true
      },
      {
        "col": "repo_past_period_rank",
        "data_type": "INT",
        "nullable": true
      },
      {
        "col": "repo_rank_changes",
        "data_type": "BIGINT",
        "nullable": true
      },
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
          repos: {
            type: 'string',
            description: 'The number of repositories in the collection'
          },
          repo_id: {
            type: 'string',
            description: 'Repository ID'
          },
          repo_name: {
            type: 'string',
            description: 'Repository name'
          },
          repo_current_period_rank: {
            type: 'string',
            description: 'The rank of the repository in the collection in the current period'
          },
          repo_past_period_rank: {
            type: 'string',
            description: 'The rank of the repository in the collection in the past period'
          },
          repo_rank_changes: {
            type: 'string',
            description: 'The rank changes of the repository in the collection'
          }
        },
        additionalProperties: true,
      },
      example: [
        {
          "id": "10010",
          "name": "Artificial Intelligence",
          "repos": "36",
          "repo_id": "155220641",
          "repo_name": "huggingface/transformers",
          "repo_current_period_rank": "1",
          "repo_past_period_rank": "1",
          "repo_rank_changes": "0"
        },
        {
          "id": "10010",
          "name": "Artificial Intelligence",
          "repos": "36",
          "repo_id": "65600975",
          "repo_name": "pytorch/pytorch",
          "repo_current_period_rank": "3",
          "repo_past_period_rank": "4",
          "repo_rank_changes": "1"
        },
        {
          "id": "10010",
          "name": "Artificial Intelligence",
          "repos": "36",
          "repo_id": "458588993",
          "repo_name": "nebuly-ai/nebullvm",
          "repo_current_period_rank": "2",
          "repo_past_period_rank": "2",
          "repo_rank_changes": "0"
        },
        {
          "id": "10078",
          "name": "ChatGPT Apps",
          "repos": "36",
          "repo_id": "599394820",
          "repo_name": "Chanzhaoyu/chatgpt-web",
          "repo_current_period_rank": "3",
          "repo_past_period_rank": "6",
          "repo_rank_changes": "3"
        },
        {
          "id": "10078",
          "name": "ChatGPT Apps",
          "repos": "36",
          "repo_id": "609416865",
          "repo_name": "yetone/openai-translator",
          "repo_current_period_rank": "2",
          "repo_past_period_rank": "",
          "repo_rank_changes": ""
        },
        {
          "id": "10078",
          "name": "ChatGPT Apps",
          "repos": "36",
          "repo_id": "608555244",
          "repo_name": "microsoft/visual-chatgpt",
          "repo_current_period_rank": "1",
          "repo_past_period_rank": "",
          "repo_rank_changes": ""
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
