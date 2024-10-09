import {getDb} from "@db/index";
import {sql} from "kysely";

export async function deleteCacheByCollectionId(collectionId: number) {
  if (collectionId === undefined || collectionId === null) {
    throw new Error('Must provide collectionId');
  }

  // TODO: using `cache` table instead of `cached_table_cache`.
  return await getDb().deleteFrom('cached_table_cache')
    .where('cache_key', 'like', sql<string>`concat(${sql.val('query:collection%')}, ${sql.val(collectionId)}, '%')`)
    .executeTakeFirstOrThrow();
}