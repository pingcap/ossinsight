type IssueFields = 'body' | 'title' | 'labels' | 'template' | 'milestone' | 'assignee' | 'projects';

export function createIssueLink (repo: string, options: Partial<Record<IssueFields, string>> = {}) {
  const url = new URL(`https://github.com/${repo}/issues/new`);
  Object.entries(options).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}
