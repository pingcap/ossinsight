import type { Collection, RepoInfo, SearchRepoInfo, UserInfo, UserType } from '@ossinsight/api';
import { AxiosRequestConfig } from 'axios';
import { RemoteData } from '../components/RemoteCharts/hook';
import { client } from './client';

export async function query<R, P = any>(query: string, params?: P, config?: Omit<AxiosRequestConfig, 'params'>): Promise<RemoteData<P, R>> {
  return client.get<any, RemoteData<P, R>>(`/q/${query}`, { params, ...config }).then(response => {
    response.query = query;
    return response;
  });
}

export async function getRepo(name: string): Promise<RepoInfo> {
  return client.get(`/gh/repo/${name}`).then(({ data }) => data);
}

export async function searchRepo(keyword: string): Promise<SearchRepoInfo[]> {
  return client.get(`/gh/repos/search`, { params: { keyword } }).then(({ data }) => data);
}

export async function searchUser(keyword: string, type: UserType = 'user'): Promise<UserInfo[]> {
  return client.get(`/gh/users/search`, { params: { keyword, type } }).then(({ data }) => data);
}

export async function getCollections(): Promise<RemoteData<{}, Collection>> {
  return client.get(`/collections`);
}
