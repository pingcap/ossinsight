import {FastifyPluginAsync} from "fastify";
import {getSuccessResponse, proxyGet} from "../../../../../utils/endpoint";

const schema = {
  operationId: 'collection-repo-ranking-by-prs',
  summary: 'Repository ranking by prs',
  method: 'GET',
  description: `Rank the GitHub repositories in the specified collection according to the number of pull requests.`,
  tags: ['Collections'],
  querystring: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        description: 'The period of the range.',
        enum: ['past_28_days', 'past_month'],
        default: 'past_28_days'
      }
    }
  },
  params: {
    type: 'object',
    required: ['collection_id'],
    properties: {
      collection_id: {
        type: 'number',
        description: 'The ID of collection'
      }
    }
  },
  response: {
    200: getSuccessResponse([
      {
        "col": "repo_id",
        "data_type": "BIGINT",
        "nullable": false
      },
      {
        "col": "repo_name",
        "data_type": "VARCHAR",
        "nullable": false
      },
      {
        "col": "current_period_growth",
        "data_type": "BIGINT",
        "nullable": false
      },
      {
        "col": "current_period_rank",
        "data_type": "BIGINT",
        "nullable": false
      },
      {
        "col": "past_period_growth",
        "data_type": "BIGINT",
        "nullable": false
      },
      {
        "col": "past_period_rank",
        "data_type": "BIGINT",
        "nullable": false
      },
      {
        "col": "growth_pop",
        "data_type": "DECIMAL",
        "nullable": false
      },
      {
        "col": "rank_pop",
        "data_type": "BIGINT",
        "nullable": false
      },
      {
        "col": "total",
        "data_type": "BIGINT",
        "nullable": false
      }
    ], {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          repo_id: {
            type: 'string',
            description: 'The repository ID'
          },
          repo_name: {
            type: 'string',
            description: 'The repository name'
          },
          current_period_growth: {
            type: 'string',
            description: 'prs growth in the current period (past 28 days / current month)'
          },
          past_period_growth: {
            type: 'string',
            description: 'prs growth in the past period (The 28 days before the past 28 days / past month)'
          },
          growth_pop: {
            type: 'string',
            description: 'The period-over-period growth of prs'
          },
          rank_pop: {
            type: 'string',
            description: 'The period-over-period rank changes of prs'
          },
          total: {
            type: 'string',
            description: 'The current total prs of repository'
          }
        },
        additionalProperties: true,
      },
      example: [
        {
          "repo_id": "16563587",
          "repo_name": "cockroachdb/cockroach",
          "current_period_growth": "677",
          "past_period_growth": "729",
          "growth_pop": "-7.13",
          "rank_pop": "0",
          "total": "54541",
          "current_period_rank": "1",
          "past_period_rank": "1"
        },
        {
          "repo_id": "60246359",
          "repo_name": "clickhouse/clickhouse",
          "current_period_growth": "268",
          "past_period_growth": "296",
          "growth_pop": "-9.46",
          "rank_pop": "-1",
          "total": "16732",
          "current_period_rank": "2",
          "past_period_rank": "3"
        },
        {
          "repo_id": "41986369",
          "repo_name": "pingcap/tidb",
          "current_period_growth": "263",
          "past_period_growth": "214",
          "growth_pop": "22.90",
          "rank_pop": "-3",
          "total": "15622",
          "current_period_rank": "3",
          "past_period_rank": "6"
        },
        {
          "repo_id": "105944401",
          "repo_name": "yugabyte/yugabyte-db",
          "current_period_growth": "246",
          "past_period_growth": "298",
          "growth_pop": "-17.45",
          "rank_pop": "2",
          "total": "15079",
          "current_period_rank": "4",
          "past_period_rank": "2"
        },
        {
          "repo_id": "208728772",
          "repo_name": "milvus-io/milvus",
          "current_period_growth": "234",
          "past_period_growth": "237",
          "growth_pop": "-1.27",
          "rank_pop": "0",
          "total": "8675",
          "current_period_rank": "5",
          "past_period_rank": "5"
        },
        {
          "repo_id": "507775",
          "repo_name": "elastic/elasticsearch",
          "current_period_growth": "214",
          "past_period_growth": "144",
          "growth_pop": "48.61",
          "rank_pop": "-3",
          "total": "31578",
          "current_period_rank": "6",
          "past_period_rank": "9"
        }
      ]
    }, {
      row_count: 7
    }),
  }
};

const queryHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  proxyGet(app, opts, schema);
}

export default queryHandler;
