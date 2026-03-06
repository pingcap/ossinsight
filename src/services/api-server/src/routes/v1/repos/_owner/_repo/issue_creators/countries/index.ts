import {FastifyPluginAsync} from "fastify";
import {proxyGet, getSuccessResponse} from "../../../../../../../utils/endpoint";

const schema = {
  operationId: 'list-countries-of-issue-creators',
  summary: 'List countries/regions of issue creators',
  method: 'GET',
  description: `List countries/regions of stargazers for the specified repository.
  
> **Notice**:
> In the overall data, about **3.5%** of GitHub users provided valid country/region information.

> **Note**: 
> By default, the API does not count users without valid country/region information. 
> If you need to count these users, you can set the \`exclude_unknown\` parameter to \`false\`.
`,
  tags: ['Issue Creators'],
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
        col: "percentage",
        data_type: "DECIMAL",
        nullable: true
      },
      {
        col: "issue_creators",
        data_type: "BIGINT",
        nullable: true
      },
    ], {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          country_code: {
            type: 'string',
            description: 'Country/region code'
          },
          issue_creators: {
            type: 'string',
            description: 'Number of issue creators from the country/region'
          },
          percentage: {
            type: 'string',
            description: 'Percentage of issue creators from the country/region'
          },
        },
        additionalProperties: true,
      },
      example: [
        {
          "country_code": "CN",
          "issue_creators": "7131",
          "percentage": "0.8749"
        },
        {
          "country_code": "US",
          "issue_creators": "316",
          "percentage": "0.0388"
        },
        {
          "country_code": "CA",
          "issue_creators": "243",
          "percentage": "0.0298"
        },
        {
          "country_code": "NL",
          "issue_creators": "223",
          "percentage": "0.0274"
        },
      ]
    }, {
      row_count: 4
    }),
  }
};

const queryHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  proxyGet(app, opts, schema);
}

export default queryHandler;
