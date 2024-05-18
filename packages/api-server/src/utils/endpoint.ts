import {APIError} from "./error";
import {FastifyInstance} from "fastify";

export function proxyGet(
  app: FastifyInstance,
  opts: Record<any, any>,
  schema: Record<any, any>
) {
    app.get('/', {
      config: {
        rateLimit: {
          max: app.config.PUBLIC_API_HOURLY_RATE_LIMIT,
          timeWindow: '1 hour'
        }
      },
      schema
    }, async function (req, reply) {
      if (!app.tidbDataService) {
        throw new APIError(500, 'TiDB data service is not initialized.');
      }

      // Remove prefix and query string from url.
      const url = new URL(req.url, 'http://localhost');
      let pathname = url.pathname.replace(/^\/(public|v1)/, '');
      

      // Map query params to query strings.
      const query = req.query as any;
      const queryKeys = Object.keys(query);
      const queryStrings = [];
      queryStrings.push(...queryKeys.map((queryKey) => {
        return `${queryKey}=${encodeURIComponent(query[queryKey])}`;
      }));

      // Remove path params from url.
      const params = req.params as any;
      const paramKeys = Object.keys(params);
      for (const paramKey of paramKeys) {
        pathname = pathname.replace(`/${params[paramKey]}`, '');
      }

      // TODO: remove it after TiDB data service supports path params.
      // Map path params to query strings.
      queryStrings.push(...paramKeys.map((paramKey) => {
        return `${paramKey}=${encodeURIComponent(params[paramKey])}`;
      }));

      // Remove trailing slash from url.
      //
      // Notice: Data Service is strict in path routing.
      // If there is / at the end of the path, the route cannot be matched correctly.
      if (pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }

      // Retrieve query result from TiDB data service.
      const targetURL = `${pathname}?${queryStrings.join('&')}`;     
      const res = await app.tidbDataService.request(targetURL);
      delete res.headers['transfer-encoding'];

      reply
        .code(res.status)
        .headers(res.headers)
        .send(res.data);
    })
}

export interface DataServiceResponseColumn {
  col: string;
  data_type: string;
  nullable: boolean
}

export interface DataServiceResponseRowsDefinition {
  type: string;
  items: Record<any, any>,
  example?: any[]
}

export interface DataServiceResponseResult {
  code: number;
  message: string;
  start_ms: number;
  end_ms: number;
  latency: string;
  row_count: number;
  row_affect: number;
  limit: number;
  databases: string[];
}

export function getSuccessResponse(
  columnsExample: DataServiceResponseColumn[] = [],
  rowsDefinition: DataServiceResponseRowsDefinition = {
    type: 'array',
    items:  {
      type: 'object',
        additionalProperties: {
        type: 'string'
      }
    }
  },
  resultExampleOverride: Partial<DataServiceResponseResult> = {}
) {
  const resultExample = {
    code: 200,
    message: 'Query OK!',
    start_ms: 1690957407469,
    end_ms: 1690957407499,
    latency: '30ms',
    row_count: 10,
    row_affect: 0,
    limit: 50,
    databases: ['gharchive_dev'],
    ...resultExampleOverride
  };

  return {
    type: 'object',
    required: ['type', 'data'],
    properties: {
      type: {
        type: 'string',
        description: 'The type of the endpoint.',
        enum: ['sql_endpoint'],
        example: 'sql_endpoint',
      },
      data: {
        type: 'object',
        required: ['columns', 'rows', 'result'],
        properties: {
          columns: {
            type: 'array',
            items: {
              type: 'object',
              required: ['col', 'data_type', 'nullable'],
              properties: {
                col: {
                  type: 'string',
                  description: 'The name of the column in the query result.',
                },
                data_type: {
                  type: 'string',
                  enum: ['CHAR', 'BIGINT', 'DECIMAL', 'INT', 'UNSIGNED BIGINT', 'TINYINT', 'TIMESTAMP', 'TEXT', 'VARCHAR', 'DATETIME', 'DOUBLE', 'FLOAT', 'DATE', 'TIME', 'YEAR', 'MEDIUMINT', 'SMALLINT', 'BIT', 'BINARY', 'VARBINARY', 'JSON', 'ENUM', 'SET', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT', 'TINYBLOB', 'MEDIUMBLOB', 'BLOB', 'LONGBLOB'],
                  description: 'The data type of the column.',
                },
                nullable: {
                  type: 'boolean',
                  description: 'Whether the column is nullable.',
                }
              },
              additionalProperties: true,
            },
            example: columnsExample
          },
          rows: rowsDefinition,
          result: {
            type: 'object',
            properties: {
              code: {
                type: 'number',
                description: 'The code of the response.',
              },
              message: {
                type: 'string',
                description: 'The message of the response.',
              },
              start_ms: {
                type: 'number',
                description: 'The start time of the query in milliseconds.',
              },
              end_ms: {
                type: 'number',
                description: 'The end time of the query in milliseconds.',
              },
              latency: {
                type: 'string',
                description: 'The latency of the query.',
              },
              row_count: {
                type: 'number',
                description: 'The number of rows in the query result.',
              },
              row_affect: {
                type: 'number',
                description: 'The number of rows affected by the query.',
              },
              limit: {
                type: 'number',
                description: 'The maximum number of rows in the query result.',
              },
              databases: {
                type: 'array',
                description: 'The databases used in the query.',
                items: {
                  type: 'string',
                },
              }
            },
            additionalProperties: true,
            example: resultExample
          }
        }
      }
    }
  }
}