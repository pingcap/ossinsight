import {FastifyPluginAsync} from "fastify";
import {proxyGet, getSuccessResponse} from "../../../../../../utils/endpoint";

const schema = {
  operationId: 'list-pull-request-creators',
  summary: 'List pull request creators',
  method: 'GET',
  description: `Querying the pull request creators list in a given repository.

This API provides multiple ways to sort the query results, for example:

- \`sort=prs-desc\` (Default): Sorted in descending order based on \`prs\` field (the number of PRs they have contributed), meaning that the contributor with the most PRs is at the top.
- \`sort=first_pr_merged_at-desc\`: Sorted in descending order based on \`first_pr_merged_at\` field (the time of their first merged PR), which means you can got a list of new code contributors of the repository.
  `,
  tags: ['Pull Request Creators'],
  querystring: {
    type: 'object',
    properties: {
      sort: {
        type: 'string',
        description: 'Specify the field by which to sort the pull request creators list (values with a `-desc` suffix indicate descending sorting)',
        enum: ['login', 'prs', 'prs-desc', 'first_pr_opened_at', 'first_pr_opened_at-desc', 'first_pr_merged_at', 'first_pr_merged_at-desc'],
        default: 'prs-desc',
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
        col: "prs",
        data_type: "INT",
        nullable: true
      },
      {
        col: "first_pr_opened_at",
        data_type: "DATETIME",
        nullable: true
      },
      {
        col: "first_pr_merged_at",
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
            description: 'The ID of the pull request creator'
          },
          login: {
            type: 'string',
            description: 'The login (username) of the pull request creator'
          },
          name: {
            type: 'string',
            description: 'The name of the pull request creator'
          },
          prs: {
            type: 'string',
            description: 'The number of pull requests created by the pull request creator'
          },
          first_pr_opened_at: {
            type: 'string',
            description: 'The date of the first pull request created by the pull request creator'
          },
          first_pr_merged_at: {
            type: 'string',
            description: 'The date of the first merged pull request be merged into the repository'
          }
        },
        additionalProperties: true,
      },
      example: [
        {
          "id": "1420062",
          "login": "tiancaiamao",
          "name": "",
          "prs": "1300",
          "first_pr_opened_at": "2016-06-20 14:08:39",
          "first_pr_merged_at": "2016-06-21 07:45:27"
        },
        {
          "id": "3427324",
          "login": "hawkingrei",
          "name": "Weizhen Wang",
          "prs": "927",
          "first_pr_opened_at": "2017-05-17 15:00:50",
          "first_pr_merged_at": "2017-05-22 04:47:11"
        },
        {
          "id": "26020263",
          "login": "crazycs520",
          "name": "crazycs",
          "prs": "788",
          "first_pr_opened_at": "2018-06-12 05:02:07",
          "first_pr_merged_at": "2018-06-29 03:01:35"
        },
        {
          "id": "891222",
          "login": "coocood",
          "name": "Evan Zhou",
          "prs": "779",
          "first_pr_opened_at": "2015-09-06 05:58:15",
          "first_pr_merged_at": "2015-09-06 07:10:13"
        },
        {
          "id": "4242506",
          "login": "zimulala",
          "name": "Lynn",
          "prs": "774",
          "first_pr_opened_at": "2015-09-06 10:51:19",
          "first_pr_merged_at": "2015-09-06 12:32:33"
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
