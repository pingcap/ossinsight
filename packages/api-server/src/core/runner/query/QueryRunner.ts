import {databaseCacheIdentity} from '../../cache/database-identity';
import {createHash} from 'crypto';
import mustache from "mustache";
import {Logger} from "pino";
import CacheBuilder from "../../cache/CacheBuilder";
import { CachedData } from "../../cache/Cache";
import { DateTime } from "luxon";
import {QueryLegacyParser} from "./QueryLegacyParser";
import {QueryLiquidParser} from "./QueryLiquidParser";
import { QueryLoader } from "./QueryLoader";
import {Pool, QueryOptions} from "mysql2/promise";
import {PersistConfig, QuerySchema, isPublicQuery, validateQueryName, validateCollectionId, prepareQueryParameters} from "@ossinsight/types";
import { TiDBQueryExecutor } from "../../executor/query-executor/TiDBQueryExecutor";
import {presetQueryTimer, measure, presetQueryCounter} from "../../../metrics";
import {getQueryDataQuality, STAR_DATA_INCIDENT_MARKER} from "../../../utils/data-quality";
import {APIError, QueryDataUnavailableError} from "../../../utils/error";
import {hasCollectionProjection, refreshCollectionProjection} from './collection-projection';

export const enum QueryType {
  QUERY = 'query',
  EXPLAIN = 'explain',
}

export interface Options {
  allowPrivate?: boolean;
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
        try { validateQueryName(queryName); } catch { throw new APIError(400, 'Invalid query name.'); }
        const [queryConfig, templateSQL] = await this.queryLoader.load(queryName);
        if (!queryConfig || !templateSQL) {
          throw new Error(`Query config ${queryName} not found.`);
        }

        if (!options.allowPrivate && !isPublicQuery(queryName, queryConfig)) {
          throw new APIError(404, 'Query not found.');
        }

        let normalizedParams: Record<string, any>;
        try { normalizedParams = prepareQueryParameters(queryConfig.params || [], params); }
        catch { throw new APIError(400, 'Invalid query parameters.'); }
        const collectionParameter = queryConfig.params?.find((param: {name: string; default?: unknown}) => param.name === 'collectionId');
        if (collectionParameter && !options.allowPrivate) {
          let collectionId: number;
          try { collectionId = validateCollectionId(params.collectionId ?? collectionParameter.default); }
          catch { throw new APIError(400, 'Invalid collection ID.'); }
          const [collections] = await this.tidb.execute<any[]>('SELECT id FROM collections WHERE id = ? AND public = 1 LIMIT 1', [collectionId]);
          if (collections.length !== 1) throw new APIError(404, 'Collection not found.');
        }

        // Star-data incident gate (see src/utils/data-quality.ts): rankings
        // built on WatchEvent rows must not be served while the incident is
        // active; other event-derived queries run, but their responses carry
        // a machine-readable data_quality marker. EXPLAIN stays functional.
        const dataQuality = type === QueryType.QUERY ? getQueryDataQuality(queryName) : 'ok';
        if (dataQuality === 'blocked') {
          throw new QueryDataUnavailableError();
        }

        presetQueryCounter.inc();

        const { cacheHours = -1, onlyFromCache = false, cacheProvider } = queryConfig;
        const queryKey = this.buildQueryKey(type, queryName);
        const cacheKey = this.buildCacheKey(type, queryName, queryConfig, params, templateSQL);
        const needsFreshVisibility = !collectionParameter && /\bcollections\b/i.test(templateSQL);
        const refreshProjection = type === QueryType.QUERY && needsFreshVisibility && hasCollectionProjection(queryName);
        const cache = this.cacheBuilder.build(
          cacheProvider,
          cacheKey,
          needsFreshVisibility && !refreshProjection ? 0 : cacheHours,
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
              const persistedRows = params?.format === 'array'
                ? rows.map(row => Object.fromEntries(fields.map((field, index) => [field.name, row[index]])))
                : rows;
              await this.persistResult(`persist:${queryKey}`, queryConfig.persist, params, persistedRows);
            }

            return {
              params: normalizedParams,
              requestedAt: start,
              finishedAt: end,
              spent: end.diff(start).as('seconds'),
              sql,
              fields: fields,
              data: rows,
            };
          })
        });

        // Rebuild metadata from the same declared values used by the cache key.
        // This also protects old persisted entries and coalesced in-flight hits.
        const visibleResult = refreshProjection
          ? await refreshCollectionProjection(this.tidb, queryName, result, normalizedParams)
          : result;
        const response = {...visibleResult, params: normalizedParams};
        if (dataQuality === 'tainted') {
          // Attached after cache.load so the marker is never baked into the
          // cache and disappears as soon as the incident switch is turned off.
          return {
            ...response,
            data_quality: STAR_DATA_INCIDENT_MARKER,
          };
        }

        return response;
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
    
    private buildCacheKey (type: QueryType, queryName: string, queryConfig: QuerySchema, params: Record<string, any>, templateSQL = ''): string {
        const source = databaseCacheIdentity(this.queryExecutor?.pool);
        const context = createHash('sha256').update(JSON.stringify([process.env.NODE_ENV || 'development', source, type, queryName, queryConfig, templateSQL, this.serializeParams(queryConfig, params), params?.format === 'array'])).digest('hex');
        return `ossinsight:query:v3:${context}`;
    }
    
    private serializeParams (queryConfig: QuerySchema, params: Record<string, any>): string {
        const normalized = prepareQueryParameters(queryConfig.params || [], params);
        return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
    }

}
