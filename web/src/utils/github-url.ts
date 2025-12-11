/**
 * Cleans GitHub URLs by removing the protocol and domain prefix
 * @param text - The text that may contain a GitHub URL
 * @returns The cleaned text with GitHub prefix removed
 */
export function cleanGitHubUrl (text: string): string {
  const trimmed = text.trim()
    .replace(/^(?:https?:\/\/)?(?:www\.)?github\.com(?:\/|$)/i, '')
    .replace(/^\/+/, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');

  if (!trimmed) {
    return '';
  }

  const segments = trimmed.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '';
  }

  const [owner, repo] = segments;
  const normalizedRepo = repo?.replace(/\.git$/i, '');

  return [owner, normalizedRepo].filter(Boolean).slice(0, 2).join('/');
}
