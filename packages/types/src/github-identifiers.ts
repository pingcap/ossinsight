/** Route parameters are already decoded by the router. Never decode them again. */
export function isGitHubOwner(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(value);
}

export function isGitHubLogin(value: unknown): value is string {
  return isGitHubOwner(value) || (typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{0,63}\[bot\]$/.test(value));
}

export function isGitHubRepository(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_.-]{1,100}$/.test(value) && value !== '.' && value !== '..';
}

export function isCollectionSlug(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9-]{1,150}$/.test(value);
}
