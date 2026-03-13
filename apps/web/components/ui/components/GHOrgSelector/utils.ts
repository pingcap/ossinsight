import { API_SERVER } from '@/utils/api';
import { RemoteOrgInfo } from './GHOrgSelector';

export const ORG_SEARCH_STALE_TIME = 5 * 60 * 1000;

export function isOrgEquals(a: RemoteOrgInfo, b: RemoteOrgInfo) {
  return a.id === b.id;
}

export function getOrgSearchQueryKey(text: string) {
  return ['github-search', 'orgs', text] as const;
}

export async function searchOrg(text: string, signal?: AbortSignal): Promise<RemoteOrgInfo[]> {
  const response = await fetch(
    `${API_SERVER}/gh/organizations/search?keyword=${encodeURIComponent(
      text
    )}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Failed to search organizations: ${response.status}`);
  }
  const result = await response.json();
  return result.data ?? [];
}

export function getOrgText(repo: RemoteOrgInfo) {
  return repo.login;
}
