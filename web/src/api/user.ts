import { useUserInfo } from '@site/src/api/cookie';
import useSWR, { mutate } from 'swr';
import { clientWithoutCache } from '@site/src/api/client';
import { useCallback, useMemo, useState } from 'react';
import { isFalsy, isNullish } from '@site/src/utils/value';

export interface Subscription {
  userId: number;
  repoId: number;
  repoName: string;
  subscribed: boolean;
  subscribedAt: string;
}

export function useSubscriptions () {
  const { userInfo } = useUserInfo();

  return useSWR(userInfo ? `user(${userInfo.id}).milestones` : undefined, {
    fetcher: async () => {
      return await clientWithoutCache.get<any, Subscription[]>('/user/subscriptions', {
        withCredentials: true,
      });
    },
  });
}

export function useSubscribed (repo: string | undefined) {
  const { data = [], isValidating, mutate } = useSubscriptions();
  const [subscribing, setSubscribing] = useState(false);
  const { validated } = useUserInfo();

  const subscribed = useMemo(() => {
    if (isNullish(repo)) {
      return false;
    }
    const finder: (sub: Subscription) => boolean = (sub) => sub.repoName === repo;
    return data.findIndex(finder) !== -1;
  }, [data, repo]);

  const subscribe = useCallback(async () => {
    if (isValidating || !validated || subscribed || isFalsy(repo)) {
      return;
    }
    try {
      setSubscribing(true);
      await clientWithoutCache.put(`/repos/${repo}/subscribe`, undefined, { withCredentials: true });
      await mutate();
    } finally {
      setSubscribing(false);
    }
  }, [repo, isValidating, validated, subscribed]);

  const unsubscribe = useCallback(async () => {
    if (isValidating || !validated || !subscribed || isFalsy(repo)) {
      return;
    }
    try {
      setSubscribing(true);
      await clientWithoutCache.put(`/repos/${repo}/unsubscribe`, undefined, { withCredentials: true });
      await mutate();
    } finally {
      setSubscribing(false);
    }
  }, [repo, isValidating, validated, subscribed]);

  return { subscribed, isValidating, subscribing, subscribe, unsubscribe };
}

export async function subscribe (repo: string, oToken?: string) {
  await clientWithoutCache.put(`/repos/${repo}/subscribe`, undefined, { withCredentials: true });
  await mutate('user.milestones', undefined, { revalidate: true });
}

export async function unsubscribe (repo: string, oToken?: string) {
  await clientWithoutCache.put(`/repos/${repo}/unsubscribe`, undefined, { withCredentials: true });
  await mutate('user.milestones', undefined, { revalidate: true });
}
