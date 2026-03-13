export type RemoteRepoInfo = { id: number; fullName: string; defaultBranch: string };
export type RemoteUserInfo = { id: number; login: string };
export type RemoteOrgInfo = { id: number; login: string };

export const REPO_SEARCH_STALE_TIME = 5 * 60 * 1000;
export const USER_SEARCH_STALE_TIME = 5 * 60 * 1000;
export const ORG_SEARCH_STALE_TIME = 5 * 60 * 1000;

export function getRepoSearchQueryKey(text: string) {
  return ['github-search', 'repos', text] as const;
}

export function getUserSearchQueryKey(text: string) {
  return ['github-search', 'users', text] as const;
}

export function getOrgSearchQueryKey(text: string) {
  return ['github-search', 'orgs', text] as const;
}

function createSearchFn<T>(path: string, mapFn?: (data: any[]) => T[]) {
  return async (apiBase: string, text: string, signal?: AbortSignal): Promise<T[]> => {
    const url = `${apiBase}${path}?keyword=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data ?? [];
    return mapFn ? mapFn(data) : data;
  };
}

export const searchRepoRaw = createSearchFn<RemoteRepoInfo>(
  '/gh/repos/search',
  (data) => data.map((item: any) => ({
    id: item.id,
    fullName: item.fullName,
    defaultBranch: item.defaultBranchRef?.name ?? 'main',
  })),
);

export const searchUserRaw = createSearchFn<RemoteUserInfo>('/gh/users/search');
export const searchOrgRaw = createSearchFn<RemoteOrgInfo>('/gh/organizations/search');

/** Create bound search functions for a given API base URL */
export function createSearchFunctions(apiBase: string) {
  return {
    searchRepo: (text: string, signal?: AbortSignal) => searchRepoRaw(apiBase, text, signal),
    searchUser: (text: string, signal?: AbortSignal) => searchUserRaw(apiBase, text, signal),
    searchOrg: (text: string, signal?: AbortSignal) => searchOrgRaw(apiBase, text, signal),
  };
}
