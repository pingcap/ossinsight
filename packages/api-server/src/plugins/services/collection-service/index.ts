import {validateCollectionId} from '@ossinsight/types';
import {APIError} from '../../../utils/error';

import { CachedData } from "../../../core/cache/Cache";
import { DateTime } from "luxon";
import { RowDataPacket } from "mysql2/promise";
import { TiDBQueryExecutor } from "../../../core/executor/query-executor/TiDBQueryExecutor";
import fp from "fastify-plugin";
import {presetQueryTimer, measure, tidbQueryCounter} from "../../../metrics";

declare module 'fastify' {
  interface FastifyInstance {
      collectionService: CollectionService;
  }
}

export default fp(async (fastify) => {
    fastify.decorate('collectionService', new CollectionService(fastify.tidbQueryExecutor));
}, {
  name: '@ossinsight/collection-service',
  dependencies: [
    '@ossinsight/tidb-query-executor'
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

  constructor(readonly executor: TiDBQueryExecutor) {}

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
    // Visibility can change independently of cached analytical results.
    const sql = 'SELECT id, name, public FROM collections WHERE public = 1';
    const requestedAt = DateTime.now();
    const [data, fields] = await this.executor.execute<any[]>('collection:public-list', sql);
    const finishedAt = DateTime.now();
    return {params: {}, requestedAt, finishedAt, spent: finishedAt.diff(requestedAt).as('seconds'), sql, fields, data};
  }

  async assertPublicCollection(value: unknown): Promise<number> {
    let id: number;
    try { id = validateCollectionId(value); } catch { throw new APIError(400, 'Invalid collection ID.'); }
    const [rows] = await this.executor.execute<any[]>('collection:visibility', 'SELECT id FROM collections WHERE id = ? AND public = 1 LIMIT 1', [id]);
    if (rows.length !== 1) throw new APIError(404, 'Collection not found.');
    return id;
  }

  async getCollectionRepos(collectionId: number): Promise<CachedData<CollectionItem[]>> {
    collectionId = await this.assertPublicCollection(collectionId);
    const metric = 'collection:public-items';
    const sql = `
      SELECT ci.id, ci.collection_id, ci.repo_id, ci.repo_name
      FROM collection_items ci JOIN collections c ON c.id = ci.collection_id
      WHERE ci.collection_id = ? AND c.public = 1 AND ci.deleted_at IS NULL
    `;
    return measure(presetQueryTimer, async () => {
      const requestedAt = DateTime.now();
      tidbQueryCounter.labels({query: metric, phase: 'start'}).inc();
      try {
        const [data, fields] = await this.executor.execute<any[]>(metric, sql, [collectionId]);
        const finishedAt = DateTime.now();
        tidbQueryCounter.labels({query: metric, phase: 'success'}).inc();
        return {params: {}, requestedAt, finishedAt, spent: finishedAt.diff(requestedAt).as('seconds'), sql, fields, data};
      } catch (error) {
        tidbQueryCounter.labels({query: metric, phase: 'error'}).inc();
        throw error;
      }
    });
  }

}
