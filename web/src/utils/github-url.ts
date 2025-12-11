/**
 * Cleans GitHub URLs by removing the protocol and domain prefix
 * @param text - The text that may contain a GitHub URL
 * @returns The cleaned text with GitHub prefix removed
 */
export function cleanGitHubUrl (text: string): string {
  const trimmed = text.trim()
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/^\/+/, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');

  if (!trimmed) {
    return '';
  }

  const segments = trimmed.split('/').filter(Boolean);
  return segments.slice(0, 2).join('/');
}
