import type { RepoInfo, UserInfo } from '@ossinsight/api';
import useSWR, {SWRResponse} from 'swr'
import { getRepo, query } from './core';

export const useRepo = (repoName: string | undefined): SWRResponse<RepoInfo> => {
  return useSWR<RepoInfo>(repoName ? [repoName, 'gh:repo'] : undefined, {
    fetcher: getRepo,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}

export const useUser = (login: string | undefined): SWRResponse<UserInfo> => {
  return useSWR<UserInfo>(login ? [login, 'gh:user']: undefined, {
    fetcher: async () => {
      const { data } = await query<UserInfo>('get-user-by-login', { login })
      return data[0]
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}
