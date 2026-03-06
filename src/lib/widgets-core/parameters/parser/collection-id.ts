export default function parse (collectionId: string): number {
  const parsed = Number(collectionId);
  if (isFinite(parsed) && Number.isSafeInteger(parsed)) {
    return parsed;
  }
  throw new Error(`${collectionId} is not a valid collection_id`);
}
