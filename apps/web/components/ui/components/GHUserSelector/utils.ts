import { API_SERVER } from '@/utils/api';
import { RemoteUserInfo } from './GHUserSelector';

export const USER_SEARCH_STALE_TIME = 5 * 60 * 1000;

export function isUserEquals (a: RemoteUserInfo, b: RemoteUserInfo) {
  return a.id === b.id;
}

export function getUserSearchQueryKey(text: string) {
  return ['github-search', 'users', text] as const;
}

export async function searchUser (text: string, signal?: AbortSignal): Promise<RemoteUserInfo[]> {
  const response = await fetch(
    `${API_SERVER}/gh/users/search?keyword=${encodeURIComponent(text)}&type=user`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Failed to search users: ${response.status}`);
  }
  const result = await response.json();
  return result.data ?? [];
}

export function getUserText (repo: RemoteUserInfo) {
  return repo.login;
}
