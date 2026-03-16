import {FastifyPluginAsync} from "fastify";
import {proxyGet, getSuccessResponse} from "../../../../../../../utils/endpoint";

const schema = {
  operationId: 'list-organizations-of-issue-creators',
  summary: 'List organizations of stargazers',
  method: 'GET',
  description: `List organizations of stargazers for the specified repository. 

> **Notice**:
> In the overall data, about **5.62%** of GitHub users provided valid organization information.

> **Note**: 
> By default, the API does not count users without valid organization information. 
> If you need to count these users, you can set the \`exclude_unknown\` parameter to \`false\`.
`,
  tags: ['Issue Creators'],
  querystring: {
    type: 'object',
    properties: {
      exclude_unknown: {
        type: 'boolean',
        description: 'Whether to exclude issue creators with unknown organization information',
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
        col: "issue_creators",
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
          issue_creators: {
            type: 'string',
            description: 'Number of issue creators from the organization'
          },
          org_name: {
            type: 'string',
            description: 'Name of the organization'
          },
          percentage: {
            type: 'string',
            description: 'Percentage of issue creators from the organization'
          },
        },
        additionalProperties: true,
      },
      example: [
        {
          "issue_creators": "117",
          "org_name": "pingcap",
          "percentage": "0.2833"
        },
        {
          "issue_creators": "9",
          "org_name": "tencent",
          "percentage": "0.0218"
        },
        {
          "issue_creators": "7",
          "org_name": "alibaba",
          "percentage": "0.0169"
        },
        {
          "issue_creators": "6",
          "org_name": "bytedance",
          "percentage": "0.0145"
        }
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
