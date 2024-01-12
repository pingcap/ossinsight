import useSWR, { mutate } from 'swr';
import { clientWithoutCache } from '@site/src/api/client';
import { useCallback, useMemo, useState } from 'react';
import { isFalsy, isNonemptyString, isNullish, notNullish } from '@site/src/utils/value';
import { useEventCallback } from '@mui/material';
import usePollingCookieState from '@site/src/hooks/useCookie';
import { useAuth0 } from '@auth0/auth0-react';

interface UserInfo {
  id: number;
  name: string;
  emailAddress: string;
  emailGetUpdates: boolean;
  githubId: number;
  githubLogin: string;
  createdAt: string;
}

// ! to be removed
export function useUserInfo () {
  const [oToken] = usePollingCookieState('o-token', { pollInterval: 1000 });

  const { data, isValidating, mutate } = useSWR(isNonemptyString(oToken) ? `user.info:${oToken}` : undefined, {
    fetcher: async () => await clientWithoutCache.get<any, UserInfo>('/user', { withCredentials: true }),
    shouldRetryOnError: false,
    onError: () => {
      mutate(undefined, { revalidate: false }).catch(console.error);
    },
  });

  const login = useEventCallback(() => {
    window.open('https://api.ossinsight.io/login/github', '_blank');
  });

  const logout = useEventCallback(() => {
    clientWithoutCache.get('/logout', { withCredentials: true })
      .then(async () => await mutate(undefined, { revalidate: false }))
      .catch(console.error);
  });

  return {
    oToken,
    userInfo: data,
    validating: isValidating,
    validated: notNullish(data),
    mutate,
    logout,
    login,
  };
}

export interface Subscription {
  userId: number;
  repoId: number;
  repoName: string;
  subscribed: boolean;
  subscribedAt: string;
}

export function useSubscriptions () {
  const { user: userInfo, getAccessTokenSilently } = useAuth0();

  return useSWR(userInfo ? `user(${userInfo.sub as string}).milestones` : undefined, {
    fetcher: async () => {
      const accessToken = await getAccessTokenSilently();
      return await clientWithoutCache.get<any, Subscription[]>('/user/subscriptions', {
        withCredentials: true,
        oToken: accessToken,
      });
    },
  });
}

export function useSubscribed (repo: string | undefined) {
  const { data = [], isValidating, mutate } = useSubscriptions();
  const [subscribing, setSubscribing] = useState(false);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const subscribed = useMemo(() => {
    if (isNullish(repo)) {
      return false;
    }
    const finder: (sub: Subscription) => boolean = (sub) => sub.repoName === repo;
    return data.findIndex(finder) !== -1;
  }, [data, repo]);

  const subscribe = useCallback(async () => {
    if (isValidating || !isAuthenticated || subscribed || isFalsy(repo)) {
      return;
    }
    try {
      setSubscribing(true);
      const accessToken = await getAccessTokenSilently();
      await clientWithoutCache.put(`/repos/${repo}/subscribe`, undefined, { withCredentials: true, oToken: accessToken });
      await mutate();
    } finally {
      setSubscribing(false);
    }
  }, [repo, isValidating, isAuthenticated, subscribed]);

  const unsubscribe = useCallback(async () => {
    if (isValidating || !isAuthenticated || !subscribed || isFalsy(repo)) {
      return;
    }
    try {
      setSubscribing(true);
      const accessToken = await getAccessTokenSilently();
      await clientWithoutCache.put(`/repos/${repo}/unsubscribe`, undefined, { withCredentials: true, oToken: accessToken });
      await mutate();
    } finally {
      setSubscribing(false);
    }
  }, [repo, isValidating, isAuthenticated, subscribed]);

  return { subscribed, isValidating, subscribing, subscribe, unsubscribe };
}

export async function subscribe (repo: string, oToken?: string) {
  await clientWithoutCache.put(`/repos/${repo}/subscribe`, undefined, { withCredentials: true, oToken });
  await mutate('user.milestones', undefined, { revalidate: true });
}

export async function unsubscribe (repo: string, oToken?: string) {
  await clientWithoutCache.put(`/repos/${repo}/unsubscribe`, undefined, { withCredentials: true, oToken });
  await mutate('user.milestones', undefined, { revalidate: true });
}
