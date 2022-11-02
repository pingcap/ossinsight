import type { RepoInfo, UserInfo } from '@ossinsight/api';
import useSWR, { SWRResponse } from 'swr';
import { getRepo, query } from './core';

export const useRepo = (repoName: string | undefined): SWRResponse<RepoInfo> => {
  return useSWR<RepoInfo>(repoName ? [repoName, 'gh:repo'] : undefined, {
    fetcher: getRepo,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

export const useUser = (login: string | undefined): SWRResponse<UserInfo> => {
  return useSWR<UserInfo>(login ? [login, 'gh:user'] : undefined, {
    fetcher: async () => {
      const { data } = await query<UserInfo>('get-user-by-login', { login });
      if (data.length === 1) {
        return data[0];
      } else {
        throw new Error(`${data.length} user found.`);
      }
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};
