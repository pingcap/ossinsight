export default function parse (repoId: string): number {
  const parsed = Number(repoId);
  if (isFinite(parsed) && Number.isSafeInteger(parsed)) {
    return parsed;
  }
  throw new Error(`${repoId} is not a valid user_id`);
}