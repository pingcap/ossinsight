import { cancellableFetch } from '../../utils/fetch';
import { CancelablePromise } from '../../utils/promise';
import { RemoteOrgInfo } from './GHOrgSelector';

export function isOrgEquals(a: RemoteOrgInfo, b: RemoteOrgInfo) {
  return a.id === b.id;
}

export function searchOrg(text: string): CancelablePromise<RemoteOrgInfo[]> {
  return cancellableFetch(
    `https://api.ossinsight.io/gh/organizations/search?keyword=${encodeURIComponent(
      text
    )}`
  )
    .then((res) => res.json())
    .then((res) => res.data);
}

export function getOrgText(repo: RemoteOrgInfo) {
  return repo.login;
}
