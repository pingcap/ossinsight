import mustache from "mustache";
import {Logger} from "pino";
import CacheBuilder from "../../cache/CacheBuilder";
import { CachedData } from "../../cache/Cache";
import { DateTime } from "luxon";
import {QueryLegacyParser} from "./QueryLegacyParser";
import {QueryLiquidParser} from "./QueryLiquidParser";
import { QueryLoader } from "./QueryLoader";
import {Pool, QueryOptions} from "mysql2/promise";
import {PersistConfig, QuerySchema} from "@ossinsight/types";
import { TiDBQueryExecutor } from "../../executor/query-executor/TiDBQueryExecutor";
import {presetQueryTimer, measure, presetQueryCounter} from "../../../metrics";
import {getQueryDataQuality, STAR_DATA_INCIDENT_MARKER} from "../../../utils/data-quality";
import {APIError} from "../../../utils/error";

export const enum QueryType {
  QUERY = 'query',
  EXPLAIN = 'explain',
}

export interface Options {
  refreshCache?: boolean;
  ignoreOnlyFromCache?: boolean;
  queryOptions?: Partial<QueryOptions>;
}

export class QueryRunner {
    private readonly liquidQueryParser: QueryLiquidParser;
    private readonly legacyQueryParser: QueryLegacyParser;

    constructor(
      private readonly logger: Logger,
      private readonly cacheBuilder: CacheBuilder,
      private readonly queryLoader: QueryLoader,
      private readonly queryExecutor: TiDBQueryExecutor,
      private readonly tidb: Pool
    ) {
      this.liquidQueryParser = new QueryLiquidParser();
      this.legacyQueryParser = new QueryLegacyParser();
    }

    async query <T> (
      queryName: string,
      params: Record<string, any>,
      options?: Options
    ): Promise<CachedData<T>> {
      return this.run(QueryType.QUERY, queryName, params, options);
    }
  
    async explain <T> (
      queryName: string,
      params: Record<string, any>,
      options?: Options
    ): Promise<CachedData<T>> {
      return this.run(QueryType.EXPLAIN, queryName, params, {
        ...options,
        ignoreOnlyFromCache: true
      });
    }

    async run(
      type: QueryType,
      queryName: string,
      params: Record<string, any>,
      options: Options = {}
    ) {
        const { ignoreOnlyFromCache = false, refreshCache = false, queryOptions } = options;
        const [queryConfig, templateSQL] = await this.queryLoader.load(queryName);
        if (!queryConfig || !templateSQL) {
          throw new Error(`Query config ${queryName} not found.`);
        }

        // Star-data incident gate (see src/utils/data-quality.ts): rankings
        // built on WatchEvent rows must not be served while the incident is
        // active; other event-derived queries run, but their responses carry
        // a machine-readable data_quality marker. EXPLAIN stays functional.
        const dataQuality = type === QueryType.QUERY ? getQueryDataQuality(queryName) : 'ok';
        if (dataQuality === 'blocked') {
          throw new APIError(
            503,
            `Query "${queryName}" is temporarily unavailable: it ranks repositories by star events, ` +
            `and GitHub's public events firehose has been degraded since ${STAR_DATA_INCIDENT_MARKER.suspect_since}. ` +
            'See the payload.data_quality field for details.',
            undefined,
            { data_quality: STAR_DATA_INCIDENT_MARKER }
          );
        }

        presetQueryCounter.inc();

        const { cacheHours = -1, onlyFromCache = false, cacheProvider } = queryConfig;
        const queryKey = this.buildQueryKey(type, queryName);
        const cacheKey = this.buildCacheKey(type, queryName, queryConfig, params);
        const cache = this.cacheBuilder.build(
          cacheProvider,
          cacheKey,
          cacheHours,
          ignoreOnlyFromCache ? false : onlyFromCache,
          refreshCache
        );
    
        const result = await cache.load(async () => {
          return await measure(presetQueryTimer, async () => {
            let sql;
            if (queryConfig.engine === 'liquid') {
              sql = await this.liquidQueryParser.parse(templateSQL, queryConfig, params);
            } else {
              sql = await this.legacyQueryParser.parse(templateSQL, queryConfig, params);
            }

            // Execute query.
            const start = DateTime.now();
            const [rows, fields] = await this.queryExecutor.execute<any[]>(queryKey, {
              sql: sql,
              ...queryOptions,
              rowsAsArray: params?.format === 'array',
            });
            const end = DateTime.now();

            // Persist the query result.
            if (type === QueryType.QUERY && queryConfig.persist) {
              await this.persistResult(`persist:${queryKey}`, queryConfig.persist, params, rows);
            }

            return {
              params: params,
              requestedAt: start,
              finishedAt: end,
              spent: end.diff(start).as('seconds'),
              sql,
              fields: fields,
              data: rows,
            };
          })
        });

        if (dataQuality === 'tainted') {
          // Attached after cache.load so the marker is never baked into the
          // cache and disappears as soon as the incident switch is turned off.
          return {
            ...result,
            data_quality: STAR_DATA_INCIDENT_MARKER,
          };
        }

        return result;
    }

    async persistResult(key: string, cfg: PersistConfig, params: Record<string, any>, rows: any[]) {
      const { series = [], fields = [] } = cfg;
      const commonCtx: Record<string, any> = {
        $params: params,
        $now: function () {
          return function (format: string, render: any) {
            return render(DateTime.now().toFormat(format))
          }
        }
      };
      const columns = [
        ...series,
        ...fields
      ];
      const values = rows.map((row) => {
        const ctx = {
          ...commonCtx,
          $row: row,
        };
        return columns
          .filter((s) => Boolean(s.name))
          .map(s => {
            return s.expression ?
              mustache.render(s.expression, ctx) :
              ctx.$row[s.name]
          })
      });
      const insertSQL = `
        INSERT INTO ${cfg.tableName} (${columns.map(s => s.name).join(',')}) VALUES ?
        ON DUPLICATE KEY UPDATE ${columns.map(c => `${c.name} = VALUES(${c.name})`).join(',')};
      `;
      await this.tidb.query(insertSQL, [values]);
      this.logger.info(`Persisted query result <${key}> to table <${cfg.tableName}>.`);
    }

    private buildQueryKey (type: QueryType, queryName: string): string {
        return `${type}:${queryName}`;
    }
    
    private buildCacheKey (type: QueryType, queryName: string, queryConfig: QuerySchema, params: Record<string, any>): string {
        return `${this.buildQueryKey(type, queryName)}:${this.serializeParams(queryConfig, params)}${params?.format === 'array' ? '_array' : ''}`;
    }
    
    private serializeParams (queryConfig: QuerySchema, params: Record<string, any>): string {
        return queryConfig.params.map((p: any) => params[p.name]).join('_');
    }

}