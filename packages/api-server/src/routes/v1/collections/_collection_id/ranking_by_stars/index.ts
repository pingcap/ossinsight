import {FastifyPluginAsync} from "fastify";
import {getSuccessResponse, proxyGet} from "../../../../../utils/endpoint";

const schema = {
  operationId: 'collection-repo-ranking-by-stars',
  summary: 'Repository ranking by stars',
  method: 'GET',
  description: `Rank the GitHub repositories in the specified collection according to the number of stars.`,
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
            description: 'Stars growth in the current period (past 28 days / current month)'
          },
          past_period_growth: {
            type: 'string',
            description: 'Stars growth in the past period (The 28 days before the past 28 days / past month)'
          },
          growth_pop: {
            type: 'string',
            description: 'The period-over-period growth of stars'
          },
          rank_pop: {
            type: 'string',
            description: 'The period-over-period rank changes of stars'
          },
          total: {
            type: 'string',
            description: 'The current total stars of repository'
          }
        },
        additionalProperties: true,
      },
      example: [
        {
          "repo_id": "208728772",
          "repo_name": "milvus-io/milvus",
          "current_period_growth": "612",
          "current_period_rank": "1",
          "growth_pop": "-20.31",
          "past_period_growth": "768",
          "past_period_rank": "1",
          "rank_pop": "0",
          "total": "23803"
        },
        {
          "repo_id": "60246359",
          "repo_name": "clickhouse/clickhouse",
          "current_period_growth": "418",
          "current_period_rank": "2",
          "growth_pop": "-9.72",
          "past_period_growth": "463",
          "past_period_rank": "2",
          "rank_pop": "0",
          "total": "30935"
        },
        {
          "repo_id": "507775",
          "repo_name": "elastic/elasticsearch",
          "current_period_growth": "377",
          "current_period_rank": "3",
          "growth_pop": "2.45",
          "past_period_growth": "368",
          "past_period_rank": "4",
          "rank_pop": "-1",
          "total": "69228"
        },
        {
          "repo_id": "138754790",
          "repo_name": "duckdb/duckdb",
          "current_period_growth": "335",
          "current_period_rank": "4",
          "growth_pop": "-15.83",
          "past_period_growth": "398",
          "past_period_rank": "3",
          "rank_pop": "1",
          "total": "11408"
        },
        {
          "repo_id": "99919302",
          "repo_name": "apache/incubator-doris",
          "current_period_growth": "329",
          "current_period_rank": "5",
          "growth_pop": "28.02",
          "past_period_growth": "257",
          "past_period_rank": "6",
          "rank_pop": "-1",
          "total": "9310"
        },
        {
          "repo_id": "927442",
          "repo_name": "postgres/postgres",
          "current_period_growth": "210",
          "current_period_rank": "6",
          "growth_pop": "4.48",
          "past_period_growth": "201",
          "past_period_rank": "10",
          "rank_pop": "-4",
          "total": "13731"
        },
        {
          "repo_id": "41986369",
          "repo_name": "pingcap/tidb",
          "current_period_growth": "202",
          "current_period_rank": "7",
          "growth_pop": "-3.81",
          "past_period_growth": "210",
          "past_period_rank": "8",
          "rank_pop": "-1",
          "total": "36325"
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
