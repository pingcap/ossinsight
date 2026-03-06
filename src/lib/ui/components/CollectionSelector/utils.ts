import type { CollectionInfo } from './CollectionSelector';

export function getCollectionText (collection: CollectionInfo) {
  return collection.name;
}

export function isCollectionEquals (a: CollectionInfo, b: CollectionInfo) {
  return a.id === b.id;
}

export const collectionsPromise = fetch('https://api.ossinsight.io/collections')
  .then(res => res.json())
  .then(res => res.data as CollectionInfo[])
  .catch(e => {
    console.error(e);
    return [] as CollectionInfo[];
  });
