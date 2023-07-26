import {FastifyInstance} from "fastify";
import {APIError} from "./error";

export function proxyGet(
  app: FastifyInstance,
  opts: Record<any, any>,
  schema: Record<any, any>
) {
    app.get('/', { schema }, async function (req, reply) {
      if (!app.tidbDataService) {
        throw new APIError(500, 'TiDB data service is not initialized.');
      }

      // Remove prefix from url.
      let url = req.url.replace(/^\/public/, '');

      // Map query params to query strings.
      const query = req.query as any;
      const queryKeys = Object.keys(query);
      const queryStrings = queryKeys.map((queryKey) => {
        return `${queryKey}=${query[queryKey]}`;
      });

      // Remove path params from url.
      const params = req.params as any;
      const paramKeys = Object.keys(params);
      for (const paramKey of paramKeys) {
        url = url.replace(`/${params[paramKey]}`, '');
      }

      // TODO: remove it after TiDB data service supports path params.
      // Map path params to query strings.
      queryStrings.push(...paramKeys.map((paramKey) => {
        return `${paramKey}=${params[paramKey]}`;
      }));

      // Remove trailing slash from url.
      if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }

      // Retrieve query result from TiDB data service.
      const targetURL = `${url}?${queryStrings.join('&')}`;
      const res = await app.tidbDataService.request(targetURL);
      const json = await res.json();
      reply
        .code(res.status)
        .headers(res.headers)
        .send(json);
    })
}

export function successResponse(examples: any[] = []) {
  return {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        description: 'The type of the endpoint.',
        enum: ['sql_endpoint'],
      },
      data: {
        type: 'object',
        properties: {
          columns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                col: {
                  type: 'string'
                },
                data_type: {
                  type: 'string',
                  enum: ['CHAR', 'BIGINT', 'DECIMAL', 'INT', 'UNSIGNED BIGINT', 'TINYINT', 'TIMESTAMP', 'TEXT', 'VARCHAR', 'DATETIME', 'DOUBLE', 'FLOAT', 'DATE', 'TIME', 'YEAR', 'MEDIUMINT', 'SMALLINT', 'BIT', 'BINARY', 'VARBINARY', 'JSON', 'ENUM', 'SET', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT', 'TINYBLOB', 'MEDIUMBLOB', 'BLOB', 'LONGBLOB']
                },
                nullable: {
                  type: 'boolean'
                }
              }
            }
          },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: {
                type: 'string'
              }
            }
          },
          result: {
            type: 'object',
            properties: {
              code: {
                type: 'number'
              },
              message: {
                type: 'string'
              },
              start_ms: {
                type: 'number'
              },
              end_ms: {
                type: 'number'
              },
              latency: {
                type: 'string'
              },
              row_count: {
                type: 'number'
              },
              row_affect: {
                type: 'number'
              },
              limit: {
                type: 'number'
              },
              databases: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },
    examples: examples
  }
}