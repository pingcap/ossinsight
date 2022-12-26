
import CacheBuilder from "../../cache/CacheBuilder";
import { CachedData } from "../../cache/Cache";
import { DateTime } from "luxon";
import { QueryLoader } from "./QueryLoader";
import { QueryOptions } from "mysql2/promise";
import { QueryParser } from "./QueryParser";
import { QuerySchema } from "../../../types/query.schema";
import { TiDBQueryExecutor } from "../../executor/query-executor/TiDBQueryExecutor";
import {dataQueryTimer, measure} from "../../../plugins/metrics";

export const enum QueryType {
  QUERY = 'query',
  EXPLAIN = 'explain',
}

export interface Options {
  refreshCache?: boolean;
  ignoreCache?: boolean;
  ignoreOnlyFromCache?: boolean;
  queryOptions?: Partial<QueryOptions>;
}

export class QueryRunner {

    constructor(
      private readonly queryLoader: QueryLoader,
      private readonly queryParser: QueryParser,
      private readonly cacheBuilder: CacheBuilder,
      private readonly queryExecutor: TiDBQueryExecutor
    ) {}

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
      return this.run(QueryType.EXPLAIN, queryName, params, options);
    }

    async run(
      type: QueryType,
      queryName: string,
      params: Record<string, any>,
      options: Options = {}
    ) {
        const { ignoreCache = false, ignoreOnlyFromCache = false, refreshCache = false, queryOptions } = options;
        const [queryConfig, templateSQL] = await this.queryLoader.load(queryName);
        if (!queryConfig || !templateSQL) {
          throw new Error(`Query config ${queryName} not found.`);
        }

        const { cacheHours = -1, onlyFromCache = false, cacheProvider } = queryConfig;
        const queryKey = this.buildQueryKey(type, queryName);
        const cacheKey = this.buildCacheKey(type, queryName, queryConfig, params);
        const cache = this.cacheBuilder.build(
          cacheProvider,
          cacheKey,
          ignoreCache ? 0 : cacheHours,
          ignoreOnlyFromCache ? false : onlyFromCache,
          refreshCache
        );
    
        return cache.load(async () => {
          return await measure(dataQueryTimer, async () => {
            const sql = await this.queryParser.parse(templateSQL, queryConfig, params);
    
            try {
              const start = DateTime.now();
              let [rows, fields] = await this.queryExecutor.execute(queryKey, {
                sql: sql,
                ...queryOptions
              });
              const end = DateTime.now();
    
              return {
                params: params,
                requestedAt: start,
                finishedAt: end,
                spent: end.diff(start).as('seconds'),
                sql,
                fields: fields,
                data: rows,
              }
            } catch (e: any) {
              e.sql = sql
              throw e
            }
          })
        });
    }

    private buildQueryKey (type: QueryType, queryName: string): string {
        return `${type}:${queryName}`;
    }
    
    private buildCacheKey (type: QueryType, queryName: string, queryConfig: QuerySchema, params: Record<string, any>): string {
        return `${this.buildQueryKey(type, queryName)}:${this.serializeParams(queryConfig, params)}`;
    }
    
    private serializeParams (queryConfig: QuerySchema, params: Record<string, any>): string {
        return queryConfig.params.map(p => params[p.name]).join('_');
    }

}