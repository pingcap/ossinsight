import CacheBuilder, { CacheProviderTypes } from "../../../core/cache/CacheBuilder";

import { CachedData } from "../../../core/cache/Cache";
import { DateTime } from "luxon";
import { RowDataPacket } from "mysql2/promise";
import { TiDBQueryExecutor } from "../../../core/executor/query-executor/TiDBQueryExecutor";
import fp from "fastify-plugin";
import pino from "pino";
import {dataQueryTimer, measure, tidbQueryCounter} from "../../metrics";

declare module 'fastify' {
  interface FastifyInstance {
      collectionService: CollectionService;
  }
}

export default fp(async (fastify) => {
    const log = fastify.log.child({ service: 'collection-service'}) as pino.Logger;
    fastify.decorate('collectionService', new CollectionService(log, fastify.tidbQueryExecutor, fastify.cacheBuilder));
}, {
  name: 'collection-service',
  dependencies: [
    'tidb-query-executor',
    'cache-builder'
  ]
});

export interface Repo extends RowDataPacket {
  id: any;
  name: string;
  group_name: string;
}

export interface Collection {
  id: number;
  slug: string;
  name: string;
}

export interface CollectionItem {
  id: number;
  collection_id: number;
  repo_id: number;
  repo_name: string;
}

export class BadParamsError extends Error {
  readonly msg: string
  constructor(public readonly name: string, message: string) {
    super(message);
    this.msg = message
  }
}

export class CollectionService {

  constructor(
    readonly log: pino.Logger,
    readonly executor: TiDBQueryExecutor,
    public readonly cacheBuilder: CacheBuilder,
  ) {
  }

  async getOSDBRepoGroups() {
    const [repos] = await this.executor.execute<Repo[]>('osdb-repos', 'select id, name, group_name from osdb_repos;');

    if (Array.isArray(repos)) {
      const repoGroupMap = new Map();
      for (const repo of repos) {
        if (repoGroupMap.has(repo.group_name)) {
          const repoGroup = repoGroupMap.get(repo.group_name);
          repo.id = parseInt(repo.id);
          repoGroup.repos.push(repo);
        } else {
          repo.id = parseInt(repo.id);
          repoGroupMap.set(repo.group_name, {
            group_name: repo.group_name,
            repos: [repo]
          });
        }
      }

      const repoGroups = []
      for (const repoGroup of repoGroupMap.values()) {
        repoGroups.push(repoGroup);
      }
      return repoGroups;
    } else {
      return [];
    }
  }

  async getCollections(): Promise<CachedData<Collection[]>> {
    const cacheKey = 'collection:list';
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.CACHED_TABLE, cacheKey, 1, false, true
    );

    return cache.load(async () => {
      return await measure(dataQueryTimer, async () => {
        const sql = "select id, name, public from collections;";

        try {
          const start = DateTime.now()
          const [rows, fields] = await this.executor.execute(cacheKey, sql)
          const end = DateTime.now()

          return {
            params: {},
            requestedAt: start,
            finishedAt: end,
            spent: end.diff(start).as('seconds'),
            sql,
            fields: fields,
            data: rows
          }
        } catch (e: any) {
          e.sql = sql
          throw e
        }
      })
    });
  }

  async getCollectionRepos(collectionId: number): Promise<CachedData<CollectionItem[]>> {
    const cacheKey = `collection:items:${collectionId}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.CACHED_TABLE, cacheKey, 1, false, true
    );

    const collectionKey = collectionId.toString()
    if (!/^[1-9]\d*$/.test(collectionKey)) {
      throw new BadParamsError('collectionId', 'bad param: ' + collectionKey)
    }

    return cache.load(async () => {
      return await measure(dataQueryTimer, async () => {
        const sql = `
          select id, collection_id, repo_id, repo_name 
          from collection_items
          where collection_id = ${collectionKey};
        `;

        try {
          const start = DateTime.now()
          tidbQueryCounter.labels({ query: cacheKey, phase: 'start' }).inc()

          const [rows, fields] = await this.executor.execute(cacheKey, sql)

          const end = DateTime.now()
          tidbQueryCounter.labels({ query: cacheKey, phase: 'success' }).inc()

          return {
            params: {},
            requestedAt: start,
            finishedAt: end,
            spent: end.diff(start).as('seconds'),
            sql,
            fields: fields,
            data: rows
          }
        } catch (e) {
          tidbQueryCounter.labels({ query: cacheKey, phase: 'error' }).inc()
          if (e) {
            (e as any).sql = sql
          }
          throw e
        }
      })
    });
  }

}
