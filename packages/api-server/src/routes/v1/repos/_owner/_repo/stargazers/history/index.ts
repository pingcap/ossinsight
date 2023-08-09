import {FastifyPluginAsync} from "fastify";
import {proxyGet, getSuccessResponse} from "../../../../../../../utils/endpoint";

const schema = {
  operationId: 'stargazers-history',
  summary: 'Stargazers history',
  method: 'GET',
  description: 'Querying the historical trend of the number of stargazers in a given repository.',
  tags: ['Stargazers'],
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
          stargazers: {
            type: 'string',
            description: 'The cumulative number of stargazers'
          },
        }
      },
      example: [
        {
          "date": "2023-04-01",
          "stargazers": "35389"
        },
        {
          "date": "2023-05-01",
          "stargazers": "35593"
        },
        {
          "date": "2023-06-01",
          "stargazers": "35805"
        },
        {
          "date": "2023-07-01",
          "stargazers": "36019"
        },
        {
          "date": "2023-08-01",
          "stargazers": "36026"
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
