import axios, { AxiosRequestConfig } from 'axios';
import { RemoteData } from '../components/RemoteCharts/hook';
import { Collection } from '../dynamic-pages/collections/hooks/useCollection';
import { RepoInfo } from './gh';

export const BASE_URL = process.env.APP_API_BASE || 'https://api.ossinsight.io'

export function createHttpClient() {
  return  axios.create({
    baseURL: BASE_URL
  });
}

export const client = createHttpClient();

export async function query<R, P = any>(query: string, params?: P, config?: Omit<AxiosRequestConfig, 'params'>): Promise<RemoteData<P, R>> {
  return client.get<any, RemoteData<P, R>>(`/q/${query}`, { params, ...config }).then(response => {
    response.query = query
    return response
  });
}

export async function getRepo(name: string): Promise<RepoInfo> {
  return client.get(`/gh/repo/${name}`).then(({ data }) => data);
}

export async function searchRepo(keyword: string): Promise<{ id: number, fullName: string }[]> {
  return client.get(`/gh/repos/search`, { params: { keyword } }).then(({ data }) => data);
}

export async function getCollections(): Promise<RemoteData<{}, Collection>> {
  return client.get(`/collections`)
}

client.defaults.paramsSerializer = function paramsSerializer(params: any): string {
  const usp = new URLSearchParams();
  for (let [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach(item => usp.append(key, item));
    } else {
      usp.set(key, String(value));
    }
  }
  return usp.toString();
};

client.interceptors.response.use(response => {
  return response.data;
});

interface CheckReq {
  (config: AxiosRequestConfig): boolean
}

export function registerStaticData(checkReq: CheckReq, data: any) {
  client.interceptors.request.use(config => {
    if (!checkReq(config)) {
      return config
    }
    config.adapter = async () => {
      return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {'x-registered': 'true'},
        config
      }
    }
    return config
  })
}
