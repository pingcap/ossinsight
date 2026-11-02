import {APIError} from "./error";
import {FastifyInstance} from "fastify";
import {responseHeaders} from './response-headers';
import {
  STAR_DATA_INCIDENT_MARKER,
  STAR_DATA_UNAVAILABLE_MARKER,
  getPublicApiDataQuality,
} from "./data-quality";

export function publicDataServiceTarget(template: string, query: Record<string, unknown>, params: Record<string, unknown>): string {
  if (!/^\/(?:v1|public)\//.test(template) || template.includes('*')) {
    throw new APIError(500, 'Invalid public route configuration.');
  }
  const pathname = template.split('/').filter(part => part && !part.startsWith(':')).slice(1).join('/');
  const search = new URLSearchParams();
  if (Object.keys(query).length > 50) throw new APIError(400, 'Too many query parameters.');
  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value];
    if (values.length > 100 || values.some(item => !['string', 'number', 'boolean'].includes(typeof item)) || String(value).length > 2000) {
      throw new APIError(400, 'Invalid query parameter.');
    }
    search.set(key, String(value));
  }
  for (const [key, value] of Object.entries(params)) {
    if (!/^[A-Za-z0-9_.-]{1,100}$/.test(String(value)) || value === '.' || value === '..') {
      throw new APIError(400, 'Invalid route parameter.');
    }
    search.set(key, String(value));
  }
  return `/${pathname}?${search}`;
}

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

      // Derive the credentialed upstream route only from our registered template.
      const targetURL = publicDataServiceTarget(req.routeOptions.url || '', req.query as any, req.params as any);
      const pathname = targetURL.split('?')[0];
      const collectionId = (req.params as Record<string, unknown>).collection_id;
      if (collectionId !== undefined) await app.collectionService.assertPublicCollection(collectionId);

      // Star-data incident gate (see ./data-quality). proxyGet talks to TiDB
      // Data Service directly, so QueryRunner's gate never sees these routes;
      // without this check every /v1 ranking would keep serving noise.
      const dataQuality = getPublicApiDataQuality(pathname);
      if (dataQuality === 'blocked') {
        // HTTP 200 with an explicit `unavailable` envelope, not 5xx: ~470 public
        // repositories reference api.ossinsight.io, and an error status would
        // break those integrations and fire their alerting for a known data
        // condition. The empty `rows` must not be read as "no results" - that is
        // what `status: "unavailable"` is for.
        // .serializer() bypasses the route's response schema, which otherwise
        // strips data_quality: the schema describes the upstream Data Service
        // shape and has no property for it, so Fastify would silently drop the
        // one field that explains why rows is empty.
        reply
          .code(200)
          .header('Cache-Control', 'no-store')
          .header('Warning', '199 - "degraded data: star-event derived ranking unavailable"')
          .type('application/json; charset=utf-8')
          .serializer((payload: unknown) => JSON.stringify(payload))
          .send({
            type: 'sql_endpoint',
            data: { columns: [], rows: [], result: { row_count: 0 } },
            data_quality: STAR_DATA_UNAVAILABLE_MARKER,
          });
        return;
      }

      // Retrieve query result from TiDB data service.
      const res = await app.tidbDataService.request(targetURL);
      delete res.headers['transfer-encoding'];
      if (pathname === '/collections' || pathname === '/collections/hot') {
        const visible = await app.collectionService.getCollections();
        const ids = new Set(visible.data.map(collection => String(collection.id)));
        if (!Array.isArray(res.data?.data?.rows)) throw new APIError(502, 'Invalid upstream response.');
        const rows = res.data.data.rows.filter((row: any) => ids.has(String(row.id ?? row.collection_id)));
        res.data = {...res.data, data: {...res.data.data, rows, result: {...res.data.data.result, row_count: rows.length}}};
        delete res.headers['content-length'];
      }

      if (dataQuality === 'tainted') {
        const body = typeof res.data === 'object' && res.data !== null
          ? { ...res.data, data_quality: STAR_DATA_INCIDENT_MARKER }
          : res.data;
        delete res.headers['content-length'];
        reply
          .code(res.status)
          .headers(responseHeaders(res.headers))
          .header('Warning', '199 - "degraded data: event-derived counts are lower bounds"')
          .serializer((payload: unknown) => JSON.stringify(payload))
          .send(body);
        return;
      }

      reply
        .code(res.status)
        .headers(responseHeaders(res.headers))
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
