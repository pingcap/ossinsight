import { RemoteRepoInfo } from '../GHRepoSelector';
import { RemoteUserInfo } from '../GHUserSelector';
import { RemoteOrgInfo } from '../GHOrgSelector';

export type UserTuple = {
  type: 'user'
  value: RemoteUserInfo | undefined
}
export type RepoTuple = {
  type: 'repo'
  value: RemoteRepoInfo | undefined
}

export type OrgTuple = {
  type: 'org';
  value: RemoteOrgInfo | undefined;
};

export type AnalyzeTuple = UserTuple | RepoTuple | OrgTuple;
