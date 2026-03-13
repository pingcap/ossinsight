export default function parse(ownerId: string): number {
  const parsed = Number(ownerId);
  if (isFinite(parsed) && Number.isSafeInteger(parsed)) {
    return parsed;
  }
  throw new Error(`${ownerId} is not a valid owner_id`);
}
