import type { RepoInfo, UserInfo } from '@ossinsight/api';
import useSWR, { SWRResponse } from 'swr';
import { getRepo, getUser } from './core';

export const useRepo = (repoName: string | undefined): SWRResponse<RepoInfo> => {
  return useSWR<RepoInfo>(repoName ? [repoName, 'gh:repo'] : undefined, {
    fetcher: getRepo,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

export const useUser = (login: string | undefined): SWRResponse<UserInfo> => {
  return useSWR<UserInfo>(login ? [login, 'gh:user'] : undefined, {
    fetcher: getUser,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};
