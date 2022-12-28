import { SearchRepoInfo, UserInfo } from '@ossinsight/api';
import useSWR from 'swr';
import { searchRepo, searchUser } from '../../api/core';
import { useDebounced } from '../CompareHeader/useSearchRepo';
import { AsyncData } from '../RemoteCharts/hook';

export type SearchType = 'repo' | 'user';

export function useGeneralSearch<T extends SearchType> (type: T, keyword: string): AsyncData<(T extends 'repo' ? SearchRepoInfo[] : UserInfo[]) | undefined> {
  const searchKey = useDebounced(keyword, 500);

  const { data, isValidating, error } = useSWR(
    searchKey
      ? [searchKey, `search:${type}`]
      : type === 'repo'
        ? ['recommend-repo-list-1-keyword', 'search:repo']
        : ['recommend-user-list-keyword', 'search:user'], {
      fetcher: async (keyword: string): Promise<SearchRepoInfo[] | UserInfo[]> => {
        if (type === 'repo') {
          return await searchRepo(keyword);
        } else {
          return await searchUser(keyword, 'user');
        }
      },
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    });

  return {
    data: data ?? [] as any,
    error,
    loading: isValidating,
  };
}

export function useGeneralSearchWithoutDefaults<T extends SearchType> (type: T, keyword: string) {
  const searchKey = useDebounced(keyword, 500);

  const { data, isValidating, error } = useSWR(
    searchKey
      ? [searchKey, `search:${type}`]
      : undefined
    , {
      fetcher: async (keyword: string): Promise<SearchRepoInfo[] | UserInfo[]> => {
        if (type === 'repo') {
          return await searchRepo(keyword);
        } else {
          return await searchUser(keyword, 'user');
        }
      },
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    });

  return {
    data: data ?? [] as any,
    error,
    loading: isValidating,
  };
}
