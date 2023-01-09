import type {
  Collection,
  RepoInfo,
  SearchRepoInfo,
  UserInfo,
  UserType,
} from '@ossinsight/api';
import {
  AxiosAdapter,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosResponseHeaders,
} from 'axios';
import { RemoteData } from '../components/RemoteCharts/hook';
import { client, clientWithoutCache } from './client';
import { wsQueryApiAdapter } from './ws';
import { notFalsy } from '@site/src/utils/value';

export async function query<R, P = any> (
  query: string,
  params?: P,
  config: Omit<AxiosRequestConfig, 'params'> = {},
): Promise<RemoteData<P, R>> {
  let adapter: AxiosAdapter | undefined;
  if (notFalsy(config.wsApi)) {
    adapter = wsQueryApiAdapter(query, params, config.wsApi);
  }
  return await client
    .get<any, RemoteData<P, R>>(`/q/${query}`, { params, adapter, ...config })
    .then((response) => {
      response.query = query;
      return response;
    });
}

export async function queryWithoutCache<R, P = any> (
  query: string,
  params?: P,
  config: Omit<AxiosRequestConfig, 'params'> = {},
): Promise<RemoteData<P, R>> {
  let adapter: AxiosAdapter | undefined;
  if (notFalsy(config.wsApi)) {
    adapter = wsQueryApiAdapter(query, params, config.wsApi);
  }
  return await client
    .get<any, RemoteData<P, R>>(`/q/${query}`, {
    params,
    adapter,
    ...config,
    disableCache: true,
  })
    .then((response) => {
      response.query = query;
      return response;
    });
}

export async function getRepo (name: string): Promise<RepoInfo> {
  return await client.get(`/gh/repo/${name}`).then(({ data }) => data);
}

export async function searchRepo (keyword: string): Promise<SearchRepoInfo[]> {
  return await client
    .get('/gh/repos/search', { params: { keyword } })
    .then(({ data }) => data);
}

export async function searchUser (
  keyword: string,
  type: UserType = 'user',
): Promise<UserInfo[]> {
  return await client
    .get('/gh/users/search', { params: { keyword, type } })
    .then(({ data }) => data);
}

export async function getCollections (): Promise<RemoteData<{}, Collection>> {
  return await client.get('/collections');
}

export async function postPlaygroundSQL (params: {
  sql: string;
  type: 'repo' | 'user';
  id: string;
  accessToken?: string;
}): Promise<any> {
  const { accessToken, ...rest } = params;
  return await clientWithoutCache
    .post('/q/playground', rest, {
      withCredentials: true,
      oToken: accessToken,
    })
    .then((data) => data);
}

function getAiQuestionHeaders (headers: AxiosResponseHeaders) {
  const {
    'x-playground-generate-sql-limit': limit = 'NaN',
    'x-playground-generate-sql-used': used = 'NaN',
  } = headers;
  return {
    limit: parseInt(limit),
    used: parseInt(used),
  };
}

export type AiQuestionResource = {
  limit: number;
  used: number;
};

export async function aiQuestionResource (params: {
  accessToken?: string;
}): Promise<AiQuestionResource> {
  const { accessToken } = params;
  return await clientWithoutCache.get('/bot/questionToSQL/quota', {
    withCredentials: true,
    oToken: accessToken,
  });
}

export async function aiQuestion (params: {
  question: string;
  context?: { repo_id?: number, repo_name?: string };
  accessToken?: string;
}) {
  const { accessToken, ...rest } = params;
  const {
    data: { sql },
    headers,
  } = await clientWithoutCache.post<any, AxiosResponse<{ sql: string }>>(
    '/bot/questionToSQL',
    rest,
    {
      withCredentials: true,
      keepResponse: true,
      oToken: accessToken,
    },
  );

  return { sql, resource: getAiQuestionHeaders(headers) };
}
