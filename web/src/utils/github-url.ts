/**
 * Cleans GitHub URLs by removing the protocol and domain prefix
 * @param text - The text that may contain a GitHub URL
 * @returns The cleaned text with GitHub prefix removed
 */
export function cleanGitHubUrl(text: string): string {
  return text.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
}
