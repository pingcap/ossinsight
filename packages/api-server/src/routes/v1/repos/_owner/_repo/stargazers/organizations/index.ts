import {FastifyPluginAsync} from "fastify";
import {proxyGet, getSuccessResponse} from "../../../../../../../utils/endpoint";

const schema = {
  operationId: 'list-organizations-of-stargazers',
  summary: 'List organizations of stargazers',
  method: 'GET',
  description: `List organizations of stargazers for the specified repository. 

> **Notice**:
> In the overall data, about **5.62%** of GitHub users provided valid organization information.

> **Note**: 
> By default, the API does not count users without valid organization information. 
> If you need to count these users, you can set the \`exclude_unknown\` parameter to \`false\`.
`,
  tags: ['Stargazers'],
  querystring: {
    type: 'object',
    properties: {
      exclude_unknown: {
        type: 'boolean',
        description: 'Whether to exclude stargazers with unknown organization information',
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
        col: "org_name",
        data_type: "VARCHAR",
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
      }
    ], {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          org_name: {
            type: 'string',
            description: 'Name of the organization'
          },
          percentage: {
            type: 'string',
            description: 'Percentage of stargazers from the organization'
          },
          stargazers: {
            type: 'string',
            description: 'Number of stargazers from the organization'
          },
        }
      },
      example: [
        {
          "org_name": "tencent",
          "percentage": "0.0217",
          "stargazers": "199"
        },
        {
          "org_name": "bytedance",
          "percentage": "0.0192",
          "stargazers": "176"
        },
        {
          "org_name": "alibaba",
          "percentage": "0.0162",
          "stargazers": "148"
        },
        {
          "org_name": "pingcap",
          "percentage": "0.0119",
          "stargazers": "109"
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
