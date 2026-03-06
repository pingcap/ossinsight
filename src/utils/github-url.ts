/**
 * Cleans GitHub URLs by removing the protocol and domain prefix
 * @param text - The text that may contain a GitHub URL
 * @returns The cleaned text with GitHub prefix removed
 */
export function cleanGitHubUrl (text: string): string {
  const trimmed = text.trim();
  const githubUrlPattern = /^(?:https?:\/\/)?(?:www\.)?github\.com(?:\/|$)/i;

  // If it's a URL but not github.com (e.g. api.github.com), return unchanged
  if (/^https?:\/\//i.test(trimmed) && !githubUrlPattern.test(trimmed)) {
    return trimmed;
  }

  const cleaned = trimmed
    .replace(githubUrlPattern, '')
    .replace(/^\/+/, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');

  if (!cleaned) {
    return '';
  }

  const segments = cleaned.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '';
  }

  const [owner, repo] = segments;
  const normalizedRepo = repo?.replace(/\.git$/i, '');

  return [owner, normalizedRepo].filter(Boolean).slice(0, 2).join('/');
}
