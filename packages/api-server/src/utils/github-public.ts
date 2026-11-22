import {APIError} from './error';
import type {CachedData} from '../core/cache/Cache';

// Search terms, never caller-supplied GitHub qualifiers or boolean expressions.
export const githubSearchKeywordSchema = {type: 'string', minLength: 1, maxLength: 100};
export const GITHUB_RESOURCE_NOT_FOUND = 'GitHub resource not found.';

export function normalizeGithubSearchTerm(input: unknown): string {
  if (typeof input !== 'string' || input.length > 100) throw new APIError(400, 'Invalid search term.');
  const term = input.trim().replace(/ +/g, ' ');
  if (!/^[\p{L}\p{N}][\p{L}\p{N}\p{M}_. /-]*$/u.test(term)) throw new APIError(400, 'Invalid search term.');
  return term;
}

function pick(input: any, fields: readonly string[]) {
  const result: Record<string, any> = {};
  for (const field of fields) if (input?.[field] !== undefined) result[field] = input[field];
  return result;
}

export function publicGithubProfile(input: any) {
  // Public profile fields only: omit private counts, billing/plan information,
  // organization security settings and email returned to a privileged viewer.
  return pick(input, ['login', 'id', 'node_id', 'avatar_url', 'gravatar_id', 'url', 'html_url', 'type',
    'site_admin', 'name', 'company', 'blog', 'location', 'hireable', 'bio', 'description',
    'twitter_username', 'public_repos', 'public_gists', 'followers', 'following', 'created_at', 'updated_at']);
}

export function publicGithubRepository(input: any) {
  if (input?.private !== false || input?.visibility !== 'public') throw new APIError(404, GITHUB_RESOURCE_NOT_FOUND);
  const result = pick(input, ['id', 'node_id', 'name', 'full_name', 'private', 'html_url', 'description', 'fork',
    'url', 'created_at', 'updated_at', 'pushed_at', 'homepage', 'size', 'stargazers_count', 'watchers_count',
    'language', 'has_issues', 'has_projects', 'has_downloads', 'has_wiki', 'has_pages', 'has_discussions',
    'forks_count', 'archived', 'disabled', 'open_issues_count', 'license', 'allow_forking', 'is_template',
    'topics', 'visibility', 'forks', 'open_issues', 'watchers', 'default_branch', 'subscribers_count', 'network_count']);
  result.owner = publicGithubProfile(input.owner);
  return result;
}

export function publicGithubResponse<T>(input: CachedData<T>, sanitize: (value: T) => any = value => value): CachedData<any> {
  return {...pick(input, ['requestedAt', 'finishedAt', 'expiresAt', 'refresh']), data: sanitize(input.data)} as CachedData<any>;
}
