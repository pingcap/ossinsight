import {FastifyPluginAsync} from "fastify";
import {proxyGet, getSuccessResponse} from "../../../../../../utils/endpoint";

const schema = {
  operationId: 'list-issue-creators',
  summary: 'List issue creators',
  method: 'GET',
  description: 'Querying the issue creators for a given repository.',
  tags: ['Issue Creators'],
  querystring: {
    type: 'object',
    properties: {
      sort: {
        type: 'string',
        description: 'Specify the field by which to sort the issue creators list (values with a `-desc` suffix indicate descending sorting)',
        enum: ['issues', 'issues-desc', 'first_issue_opened_at', 'first_issue_opened_at-desc', 'login'],
        default: 'issues-desc',
      },
      exclude_bots: {
        type: 'boolean',
        description: 'Whether to exclude robot accounts (includes GitHub App and normal users whose username matches the pattern, for example: `ti-chi-bot`).',
        default: true,
      },
      page: {
        type: 'integer',
        description: 'Page number of the results to fetch.',
        default: 1,
      },
      page_size: {
        type: 'integer',
        description: 'The number of results per page (max 100).',
        default: 30,
      },
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
        col: "id",
        data_type: "INT",
        nullable: false
      },
      {
        col: "login",
        data_type: "VARCHAR",
        nullable: false
      },
      {
        col: "name",
        data_type: "VARCHAR",
        nullable: false
      },
      {
        col: "issues",
        data_type: "INT",
        nullable: true
      },
      {
        col: "first_issue_opened_at",
        data_type: "DATETIME",
        nullable: true
      }
    ], {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The ID of the issue creator'
          },
          login: {
            type: 'string',
            description: 'The login (username) of the issue creator'
          },
          name: {
            type: 'string',
            description: 'The name of the issue creator'
          },
          issues: {
            type: 'string',
            description: 'The number of issues created by the issue creator'
          },
          first_issue_opened_at: {
            type: 'string',
            description: 'The date of the first issue created by the issue creator'
          }
        },
        additionalProperties: true,
      },
      example: [
        {
          "id": "73684",
          "login": "yahonda",
          "name": "Yasuo Honda",
          "issues": "12",
          "first_issue_opened_at": "2022-01-04 02:47:05"
        },
        {
          "id": "1000627",
          "login": "lcwangchao",
          "name": "王超",
          "issues": "211",
          "first_issue_opened_at": "2021-06-03 01:06:44"
        },
        {
          "id": "7499936",
          "login": "qw4990",
          "name": "Yuanjia Zhang",
          "issues": "276",
          "first_issue_opened_at": "2018-12-24 02:55:49"
        },
        {
          "id": "15825830",
          "login": "AilinKid",
          "name": "Arenatlx",
          "issues": "128",
          "first_issue_opened_at": "2019-07-26 14:06:29"
        },
        {
          "id": "21033020",
          "login": "glkappe",
          "name": "",
          "issues": "29",
          "first_issue_opened_at": "2020-07-30 08:12:09"
        },
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
