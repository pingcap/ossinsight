import { SearchOrgInfo, SearchRepoInfo, UserInfo } from '@ossinsight/api';
import useSWR from 'swr';
import { searchRepo, searchUser, searchOrg } from '../../api/core';
import { useDebounced } from '../CompareHeader/useSearchRepo';
import { AsyncData } from '../RemoteCharts/hook';

export type SearchType = 'repo' | 'user' | 'org' | 'all';

export function useGeneralSearch<T extends SearchType> (
  type: T,
  keyword: string,
): AsyncData<(T extends 'repo' ? SearchRepoInfo[] : UserInfo[]) | undefined> {
  const searchKey = useDebounced(keyword, 500);

  const getRecommend = (type: string) => {
    switch (type) {
      case 'repo':
        return ['recommend-repo-list-1-keyword', 'search:repo'];
      case 'user':
        return ['recommend-user-list-keyword', 'search:user'];
      case 'org':
        return ['recommend-org-list-keyword', 'search:org'];
      default:
        return ['', 'search:all'];
    }
  };

  const { data, isValidating, error } = useSWR(
    searchKey ? [searchKey, `search:${type}`] : getRecommend(type),
    {
      fetcher: async (
        keyword: string,
      ): Promise<
      | SearchRepoInfo[]
      | UserInfo[]
      | SearchOrgInfo[]
      | Array<SearchRepoInfo | UserInfo | SearchOrgInfo>
      > => {
        if (type === 'repo') {
          return await searchRepo(keyword);
        } else if (type === 'user') {
          return await searchUser(keyword, 'user');
        } else if (type === 'org') {
          return await searchOrg(keyword);
        } else {
          const tmpKeywords = {
            repo: keyword || 'recommend-repo-list-1-keyword',
            user: keyword || 'recommend-user-list-keyword',
            org: keyword || 'recommend-org-list-keyword',
          };
          return await Promise.all([
            searchRepo(tmpKeywords.repo),
            searchUser(tmpKeywords.user, 'user'),
            searchOrg(tmpKeywords.org),
          ]).then(([repo, user, org]) => {
            return [
              ...repo.map((item) => ({ ...item, type: 'Repo' })),
              ...user.map((item) => ({ ...item, type: 'User' })),
              ...org.map((item) => ({ ...item, type: 'Org' })),
            ];
          });
        }
      },
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  return {
    data: data ?? ([] as any),
    error,
    loading: isValidating,
  };
}

export function useGeneralSearchWithoutDefaults<T extends SearchType> (
  type: T,
  keyword: string,
) {
  const searchKey = useDebounced(keyword, 500);

  const { data, isValidating, error } = useSWR(
    searchKey ? [searchKey, `search:${type}`] : undefined,
    {
      fetcher: async (
        keyword: string,
      ): Promise<
      | SearchRepoInfo[]
      | UserInfo[]
      | SearchOrgInfo[]
      | Array<SearchRepoInfo | UserInfo | SearchOrgInfo>
      > => {
        if (type === 'repo') {
          return await searchRepo(keyword);
        } else if (type === 'user') {
          return await searchUser(keyword, 'user');
        } else if (type === 'org') {
          return await searchOrg(keyword);
        } else {
          return await Promise.all([
            searchRepo(keyword),
            searchUser(keyword, 'user'),
            searchOrg(keyword),
          ]).then(([repo, user, org]) => {
            return [
              ...repo.map((item) => ({ ...item, type: 'Repo' })),
              ...user.map((item) => ({ ...item, type: 'User' })),
              ...org.map((item) => ({ ...item, type: 'Org' })),
            ];
          });
        }
      },
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  return {
    data: data ?? ([] as any),
    error,
    loading: isValidating,
  };
}
