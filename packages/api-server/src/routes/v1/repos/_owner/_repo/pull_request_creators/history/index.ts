import {FastifyPluginAsync} from "fastify";
import {proxyGet, getSuccessResponse} from "../../../../../../../utils/endpoint";

const schema = {
  operationId: 'pull-request-creators-history',
  summary: 'Pull request creators history',
  method: 'GET',
  description: 'Querying the historical trend of the number of pull request creators in a given repository.',
  tags: ['Pull Request Creators'],
  querystring: {
    type: 'object',
    properties: {
      per: {
        type: 'string',
        description: 'The time interval of the data points.',
        enum: ['day', 'week', 'month'],
        default: 'month',
      },
      from: {
        type: 'string',
        description: 'The start date of the time range.',
        default: '2000-01-01',
      },
      to: {
        type: 'string',
        description: 'The end date of the time range.',
        default: '2099-01-01',
      }
    }
  },
  params: {
    type: 'object',
    required: ['owner', 'repo'],
    properties: {
      owner: {
        type: 'string',
        description: 'The owner of the repo.',
        examples: ['pingcap']
      },
      repo: {
        type: 'string',
        description: 'The name of the repo.',
        examples: ['tidb']
      }
    }
  },
  response: {
    200: getSuccessResponse([
      {
        col: "date",
        data_type: "VARCHAR",
        nullable: true
      },
      {
        col: "pull_request_creators",
        data_type: "DECIMAL",
        nullable: true
      }
    ], {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'The date of the data point'
          },
          pull_request_creators: {
            type: 'string',
            description: 'The cumulative number of pull request creators'
          },
        }
      },
      example: [
        {
          "date": "2023-03-01",
          "pull_request_creators": "912"
        },
        {
          "date": "2023-04-01",
          "pull_request_creators": "915"
        },
        {
          "date": "2023-05-01",
          "pull_request_creators": "924"
        },
        {
          "date": "2023-06-01",
          "pull_request_creators": "932"
        },
        {
          "date": "2023-08-01",
          "pull_request_creators": "933"
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
