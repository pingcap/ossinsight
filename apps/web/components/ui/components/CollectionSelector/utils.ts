import { API_SERVER } from '@/utils/api';
import { CollectionInfo } from './CollectionSelector';

export async function searchCollections(text: string, signal?: AbortSignal): Promise<CollectionInfo[]> {
  const params = new URLSearchParams();
  if (text) {
    params.set('keyword', text);
  }
  const response = await fetch(
    `${API_SERVER}/collections/api?${params.toString()}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Failed to search collections: ${response.status}`);
  }
  const result: { data: Array<{ id: number; name: string }> } = await response.json();
  return (result.data ?? []).map(({ id, name }) => ({ id, name }));
}

export function getCollectionText(collection: CollectionInfo) {
  return collection.name;
}

export function isCollectionEquals(a: CollectionInfo, b: CollectionInfo) {
  return a.id === b.id;
}
