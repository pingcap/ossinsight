import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { unstable_serialize } from 'swr';
import { notNullish } from '@site/src/utils/value';

interface Cache {
  get: (key: string) => Promise<any>;

  set: (key: string, value: any) => Promise<void>;

  del: (key: string) => Promise<void>;
}

export const createSimpleCache = (): Cache => {
  const map = new Map();
  return {
    async get (key: string): Promise<any> {
      return await Promise.resolve(map.get(key));
    },
    async set (key: string, value: any): Promise<void> {
      map.set(key, value);
      return await Promise.resolve();
    },
    async del (key: string): Promise<void> {
      map.delete(key);
      return await Promise.resolve();
    },
  };
};

const makeKey = (config: AxiosRequestConfig): string | undefined => {
  if (config.disableCache) {
    return undefined;
  }
  return `${config.method ?? 'unknown'}:${config.url ?? 'unknown'}:${unstable_serialize(config.params)}`;
};

const cacheRequest = (cache: Cache) => async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
  const key = makeKey(config);

  if (notNullish(key)) {
    const value = await cache.get(key);
    if (notNullish(value)) {
      return {
        ...config,
        adapter: async () => await Promise.resolve(value),
      };
    }
  }
  return config;
};

const cacheResponse = (cache: Cache) => async (response: AxiosResponse): Promise<AxiosResponse> => {
  const key = makeKey(response.config);

  if (notNullish(key) && response.status >= 200 && response.status < 300) {
    await cache.set(key, response);
  }

  return response;
};

export function patchCacheInterceptors (axios: AxiosInstance, cache: Cache): () => void {
  const reqId = axios.interceptors.request.use(cacheRequest(cache));
  const resId = axios.interceptors.response.use(cacheResponse(cache));

  return () => {
    axios.interceptors.request.eject(reqId);
    axios.interceptors.response.eject(resId);
  };
}
