import { cancellableFetch } from '../../utils/fetch';
import { CancelablePromise } from '../../utils/promise';
import { RemoteUserInfo } from './GHUserSelector';

export function isUserEquals (a: RemoteUserInfo, b: RemoteUserInfo) {
  return a.id === b.id;
}

export function searchUser (text: string): CancelablePromise<RemoteUserInfo[]> {
  return cancellableFetch(`https://api.ossinsight.io/gh/users/search?keyword=${encodeURIComponent(text)}`)
    .then(res => res.json())
    .then(res => res.data);
}

export function getUserText (repo: RemoteUserInfo) {
  return repo.login;
}
