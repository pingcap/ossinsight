import { API_SERVER, INTERNAL_QUERY_API_SERVER } from '@/utils/api';
import { cancellableFetch } from '@/components/ui/utils/fetch';
import { RemoteRepoInfo } from './GHRepoSelector';

export const REPO_SEARCH_STALE_TIME = 5 * 60 * 1000;

export function isRepoEquals (a: RemoteRepoInfo, b: RemoteRepoInfo) {
  return a.id === b.id;
}

export function getRepoSearchQueryKey(text: string) {
  return ['github-search', 'repos', text] as const;
}

export async function searchRepo(text: string, signal?: AbortSignal): Promise<RemoteRepoInfo[]> {
  const response = await fetch(
    `${API_SERVER}/gh/repos/search?keyword=${encodeURIComponent(
      text
    )}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Failed to search repositories: ${response.status}`);
  }
  const result: {
    data: {
      id: number;
      fullName: string;
      defaultBranchRef?: { name: string };
    }[];
  } = await response.json();

  return (result.data ?? []).map(
    ({
      id,
      fullName,
      defaultBranchRef: { name: defaultBranch = '' } = {},
    }) => ({
      id,
      fullName,
      defaultBranch,
    })
  );
}

export function getRepoText (repo: RemoteRepoInfo) {
  return repo.fullName;
}

export function getRepoById(repoId: number | string) {
  return cancellableFetch(`${API_SERVER}/gh/repositories/${repoId}`)
    .then((res) => res.json())
    .then(
      (res: {
        data: {
          id: number;
          full_name: string;
          default_branch:string;
        };
      }) => ({
        id: res.data.id,
        fullName: res.data.full_name,
        defaultBranch: res.data.default_branch,
      })
    );
}

export function getRepoListByOrgId(ownerId: number | string) {
  return cancellableFetch(
    `${INTERNAL_QUERY_API_SERVER}/orgs/repos?ownerId=${ownerId}`
  )
    .then((res) => res.json())
    .then((res: { data?: Array<{ repo_id: number; repo_name: string }> }) =>
      (res.data ?? []).map((item) => ({
        id: item.repo_id,
        name: item.repo_name.split('/')[1],
        fullName: item.repo_name,
      }))
    );
}
