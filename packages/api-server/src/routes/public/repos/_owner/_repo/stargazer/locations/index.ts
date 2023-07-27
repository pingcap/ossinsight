import {FastifyPluginAsync} from "fastify";
import {proxyGet, successResponse} from "../../../../../../../utils/endpoint";

const schema = {
  operationId: 'list-repo-stargazer-locations',
  summary: 'List countries/regions of repo stargazers',
  method: 'GET',
  description: 'List countries/regions of stargazers for the specified repository.',
  tags: ['Repositories'],
  querystring: {
    type: 'object',
    properties: {
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
    200: successResponse([
      {
        "type": 'sql_endpoint',
        "data": {
          "columns": [
            {
              "col": "country_or_area",
              "data_type": "CHAR",
              "nullable": true
            },
            {
              "col": "count",
              "data_type": "BIGINT",
              "nullable": true
            },
            {
              "col": "percentage",
              "data_type": "DECIMAL",
              "nullable": true
            }
          ],
          "rows": [
            {
              "count": "9183",
              "country_or_area": "CN",
              "percentage": "0.5936"
            },
            {
              "count": "1542",
              "country_or_area": "US",
              "percentage": "0.0997"
            },
            {
              "count": "471",
              "country_or_area": "JP",
              "percentage": "0.0304"
            }
          ],
          "result": {
            "code": 200,
            "message": "Query OK!",
            "start_ms": 1690363357727,
            "end_ms": 1690363358540,
            "latency": "813ms",
            "row_count": 132,
            "row_affect": 0,
            "limit": 300,
            "databases": [
              "gharchive_dev"
            ]
          }
        }
      }
    ])
  }
};

const queryHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  proxyGet(app, opts, schema);
}

export default queryHandler;
