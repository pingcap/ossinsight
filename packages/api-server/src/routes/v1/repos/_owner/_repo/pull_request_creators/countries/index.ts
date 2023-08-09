import {FastifyPluginAsync} from "fastify";
import {proxyGet, getSuccessResponse} from "../../../../../../../utils/endpoint";

const schema = {
  operationId: 'list-countries-of-pr-creators',
  summary: 'List countries/regions of PR creators',
  method: 'GET',
  description: `List countries/regions of pull request creators for the specified repository.

> **Notice**:
> In the overall data, about **3.5%** of GitHub users provided valid country/region information.

> **Note**: 
> By default, the API does not count users without valid country/region information. 
> If you need to count these users, you can set the \`exclude_unknown\` parameter to \`false\`.
`,
  tags: ['Pull Request Creators'],
  querystring: {
    type: 'object',
    properties: {
      exclude_unknown: {
        type: 'boolean',
        description: 'Whether to exclude issue creators with unknown country/region information',
        default: true,
      },
      from: {
        type: 'string',
        description: 'The start date of the range.',
        default: '2000-01-01',
      },
      to: {
        type: 'string',
        description: 'The end date of the range.',
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
        col: "country_code",
        data_type: "CHAR",
        nullable: true
      },
      {
        col: "pull_request_creators",
        data_type: "BIGINT",
        nullable: true
      },
      {
        col: "percentage",
        data_type: "DECIMAL",
        nullable: true
      }
    ], {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          country_code: {
            type: 'string',
            description: 'Country/region code'
          },
          percentage: {
            type: 'string',
            description: 'Percentage of pull request creators from the country/region'
          },
          pull_request_creators: {
            type: 'string',
            description: 'Number of pull request creators from the country/region'
          },
        }
      },
      example: [
        {
          "country_code": "CN",
          "percentage": "0.8802",
          "pull_request_creators": "13619"
        },
        {
          "country_code": "NL",
          "percentage": "0.0508",
          "pull_request_creators": "786"
        },
        {
          "country_code": "US",
          "percentage": "0.0400",
          "pull_request_creators": "619"
        },
      ]
    }, {
      row_count: 3
    })
  }
};

const queryHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  proxyGet(app, opts, schema);
}

export default queryHandler;
