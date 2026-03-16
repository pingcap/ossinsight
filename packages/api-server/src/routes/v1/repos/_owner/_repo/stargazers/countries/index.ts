import {FastifyPluginAsync} from "fastify";
import {proxyGet, getSuccessResponse} from "../../../../../../../utils/endpoint";

const schema = {
  operationId: 'list-countries-of-stargazers',
  summary: 'List countries/regions of stargazers',
  method: 'GET',
  description: `List countries/regions of stargazers for the specified repository.
  
> **Notice**:
> In the overall data, about **3.5%** of GitHub users provided valid country/region information.

> **Note**: 
> By default, the API does not count users without valid country/region information. 
> If you need to count these users, you can set the \`exclude_unknown\` parameter to \`false\`.
`,
  tags: ['Stargazers'],
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
        col: "stargazers",
        data_type: "BIGINT",
        nullable: true
      },
      {
        col: "percentage",
        data_type: "DECIMAL",
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
          stargazers: {
            type: 'string',
            description: 'Number of stargazers from the country/region'
          },
          percentage: {
            type: 'string',
            description: 'Percentage of stargazers from the country/region'
          },
        }
      },
      example: [
        {
          "country_code": "CN",
          "percentage": "0.5935",
          "stargazers": "9189"
        },
        {
          "country_code": "US",
          "percentage": "0.0996",
          "stargazers": "1542"
        },
        {
          "country_code": "JP",
          "percentage": "0.0305",
          "stargazers": "473"
        },
        {
          "country_code": "DE",
          "percentage": "0.0267",
          "stargazers": "413"
        },
      ]
    }, {
      row_count: 4
    })
  }
};

const queryHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  proxyGet(app, opts, schema);
}

export default queryHandler;
