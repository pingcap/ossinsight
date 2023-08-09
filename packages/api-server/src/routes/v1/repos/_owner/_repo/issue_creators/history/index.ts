import {FastifyPluginAsync} from "fastify";
import {proxyGet, getSuccessResponse} from "../../../../../../../utils/endpoint";

const schema = {
  operationId: 'issue-creators-history',
  summary: 'Issue creators history',
  method: 'GET',
  description: 'Querying the historical trend of the number of issue creators in a given repository.',
  tags: ['Issue Creators'],
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
        col: "issue_creators",
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
          issue_creators: {
            type: 'string',
            description: 'The number of issue creators on the date point'
          },
        },
        additionalProperties: true,
      },
      example: [
        {
          "date": "2023-04-01",
          "issue_creators": "1546"
        },
        {
          "date": "2023-05-01",
          "issue_creators": "1560"
        },
        {
          "date": "2023-06-01",
          "issue_creators": "1568"
        },
        {
          "date": "2023-07-01",
          "issue_creators": "1579"
        },
        {
          "date": "2023-08-01",
          "issue_creators": "1580"
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
