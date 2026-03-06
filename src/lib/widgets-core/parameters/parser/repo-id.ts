export default function parse (repoId: string): number {
  const parsed = Number(repoId);
  if (isFinite(parsed) && Number.isSafeInteger(parsed)) {
    return parsed;
  }
  throw new Error(`${repoId} is not a valid repo_id`);
}

export function parseRepoIds(repoIds: string | string[]): number[] {
  if (typeof repoIds === 'string') {
    const parsed = Number(repoIds);
    if (!isFinite(parsed) || !Number.isSafeInteger(parsed)) {
      throw new Error(`RepoIds: ${repoIds} is not a valid repo_id`);
    }
    return [parsed];
  }
  for (const repoId of repoIds) {
    const parsed = Number(repoId);
    if (!isFinite(parsed) || !Number.isSafeInteger(parsed)) {
      throw new Error(`RepoIds: ${repoId} is not a valid repo_id in ${repoIds}`);
    }
  }
  return repoIds.map(Number);
}