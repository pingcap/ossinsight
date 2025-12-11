type IssueFields = 'body' | 'title' | 'labels' | 'template' | 'milestone' | 'assignee' | 'projects';

const GITHUB_URL_WITH_PROTOCOL = /^https?:\/\/(www\.)?github\.com\//i;
const GITHUB_URL_HOST_ONLY = /^(www\.)?github\.com\//i;

export function createIssueLink (repo: string, options: Partial<Record<IssueFields, string>> = {}) {
  const url = new URL(`https://github.com/${repo}/issues/new`);
  Object.entries(options).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

export function stripGithubUrlPrefix (value: string): string {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (GITHUB_URL_WITH_PROTOCOL.test(trimmed)) {
    return trimTrailingSlashes(trimmed.replace(GITHUB_URL_WITH_PROTOCOL, ''));
  }

  if (GITHUB_URL_HOST_ONLY.test(trimmed)) {
    return trimTrailingSlashes(trimmed.replace(GITHUB_URL_HOST_ONLY, ''));
  }

  return value;
}
