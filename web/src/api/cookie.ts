import { useCookieState } from 'ahooks';
import { clientWithoutCache } from '@site/src/api/client';
import useSWR from 'swr';
import { notNullish } from '@site/src/utils/value';

interface UserInfo {
  id: number;
  name: string;
  emailAddress: string;
  emailGetUpdates: boolean;
  githubId: number;
  githubLogin: string;
  createdAt: string;
}

export function useUserInfo () {
  const [oToken] = useCookieState('o-token');

  const { data, isValidating, mutate } = useSWR('user.info', {
    fetcher: async () => await clientWithoutCache.get<any, UserInfo>('/user', { withCredentials: true }),
  });

  return {
    oToken,
    userInfo: data,
    validating: isValidating,
    validated: !isValidating && notNullish(data),
    mutate,
  };
}
