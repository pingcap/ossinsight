const GITHUB_URL_PREFIX = /^https?:\/\/(?:www\.)?github\.com\/?/i;
const GITHUB_HOST_PREFIX = /^(?:www\.)?github\.com\/?/i;

export function normalizeGithubRepoPaste (value: string): string {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    return '';
  }

  const path = extractGithubPath(trimmed);
  if (!path) {
    return value;
  }

  const sanitizedPath = path.split(/[?#]/)[0];
  const segments = sanitizedPath.split('/').filter(Boolean);
  if (segments.length === 0) {
    return '';
  }

  const owner = stripGitSuffix(segments[0]);
  const repo = segments[1] ? stripGitSuffix(segments[1]) : undefined;
  return repo ? `${owner}/${repo}` : owner;
}

function extractGithubPath (value: string): string | undefined {
  if (GITHUB_URL_PREFIX.test(value)) {
    return value.replace(GITHUB_URL_PREFIX, '');
  }
  if (GITHUB_HOST_PREFIX.test(value)) {
    return value.replace(GITHUB_HOST_PREFIX, '');
  }
  return undefined;
}

function stripGitSuffix (segment: string): string {
  return segment.replace(/\.git$/i, '');
}
