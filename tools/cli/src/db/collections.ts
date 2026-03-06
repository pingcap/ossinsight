import {DB, getDb, values} from "@db/index";
import {Insertable, Updateable} from "kysely";
import {GithubRepos} from "@db/schema";

export type Collections = Insertable<DB['collections']>;

export async function listAllCollections() {
  return  await getDb<DB>().selectFrom('collections')
    .selectAll()
    .execute();
}


export async function listCollections() {
  return await getDb<DB>().selectFrom('collections')
    .selectAll()
    .where('deleted_at', 'is', null)
    .execute();
}

export async function insertCollection(collection: Insertable<Collections>) {
  return await getDb<DB>().insertInto('collections')
    .values(collection)
    .executeTakeFirstOrThrow();
}

export async function updateCollection(collection: Updateable<Collections>) {
  return await getDb<DB>().updateTable('collections')
    .set({
      name: collection.name,
    })
    .where('collections.id', '=', collection.id!)
    .executeTakeFirstOrThrow();
}

export async function deleteCollections(collectionIds: number[]) {
  return await getDb<DB>().updateTable('collections')
    .set({
      deleted_at: new Date()
    })
    .where('id', 'in', collectionIds)
    .executeTakeFirst();
}

export async function listCollectionItems(collectionId: number) {
  return await getDb<DB>().selectFrom('collection_items')
    .selectAll()
    .where('collection_id', '=', collectionId)
    .where('deleted_at', 'is', null)
    .execute();
}

export async function addCollectionItems(collectionId: number, repos: Insertable<GithubRepos>[]) {
  const items = repos.map((r) => ({
    repo_id: r.repo_id,
    repo_name: r.repo_name,
    collection_id: collectionId
  }));

  return await getDb<DB>().insertInto('collection_items')
      .values(items)
      .onDuplicateKeyUpdate(({ ref }) => ({
        repo_id: values(ref('repo_id')),
        repo_name: values(ref('repo_name')),
        collection_id: values(ref('collection_id')),
        deleted_at: null
      }))
      .executeTakeFirst();
}

export async function removeCollectionItems(collectionId: number, repoNames: string[]) {
  return await getDb<DB>().updateTable('collection_items')
    .set({
      deleted_at: new Date()
    })
    .where('collection_id', '=', collectionId)
    .where('repo_name', 'in', repoNames)
    .executeTakeFirst();
}
