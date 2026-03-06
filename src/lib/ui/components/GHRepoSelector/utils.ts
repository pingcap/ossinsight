import { cancellableFetch } from '../../utils/fetch';
import { CancelablePromise } from '../../utils/promise';
import { RemoteRepoInfo } from './GHRepoSelector';

export function isRepoEquals (a: RemoteRepoInfo, b: RemoteRepoInfo) {
  return a.id === b.id;
}

export function searchRepo(text: string): CancelablePromise<RemoteRepoInfo[]> {
  return cancellableFetch(
    `https://api.ossinsight.io/gh/repos/search?keyword=${encodeURIComponent(
      text
    )}`
  )
    .then((res) => res.json())
    .then(
      (res: {
        data: {
          id: number;
          fullName: string;
          defaultBranchRef?: { name: string };
        }[];
      }) =>
        res.data.map(
          ({
            id,
            fullName,
            defaultBranchRef: { name: defaultBranch = '' } = {},
          }) => ({
            id,
            fullName,
            defaultBranch,
          })
        )
    );
}

export function getRepoText (repo: RemoteRepoInfo) {
  return repo.fullName;
}

export function getRepoById(repoId: number | string) {
  return cancellableFetch(`https://api.ossinsight.io/gh/repositories/${repoId}`)
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
    `https://api.ossinsight.io/q/orgs/repos?ownerId=${ownerId}&format=array`
  )
    .then((res) => res.json())
    .then((res: { data: [number, string][] }) =>
      res.data.map(([id, name]) => ({
        id,
        name: name.split('/')[1],
        fullName: name,
      }))
    );
}
