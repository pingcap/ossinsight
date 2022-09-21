import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { unstable_serialize } from "swr";

declare module 'axios' {
  interface AxiosRequestConfig {
    disableCache?: boolean;
    wsApi?: 'unique' | true | undefined;
    excludeMeta?: boolean;
  }
}

interface Cache {
  get(key: string): Promise<any>;

  set(key: string, value: any): Promise<void>;

  del(key: string): Promise<void>;
}

export const createSimpleCache = (): Cache => {
  const map = new Map();
  return {
    get(key: string): Promise<any> {
      return Promise.resolve(map.get(key));
    },
    set(key: string, value: any): Promise<void> {
      map.set(key, value);
      return Promise.resolve();
    },
    del(key: string): Promise<void> {
      map.delete(key);
      return Promise.resolve();
    },
  };
};

const makeKey = (config: AxiosRequestConfig): string | undefined => {
  if (config.disableCache) {
    return undefined;
  }
  return config.method + ':' + config.url + ':' + unstable_serialize(config.params);
};

const cacheRequest = (cache: Cache) => async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
  const key = makeKey(config);

  if (key !== undefined) {
    const value = await cache.get(key);
    if (value !== undefined) {
      return {
        ...config,
        adapter: () => Promise.resolve(value),
      };
    }
  }
  return config;
};

const cacheResponse = (cache: Cache) => async (response: AxiosResponse): Promise<AxiosResponse> => {
  const key = makeKey(response.config);

  if (key !== undefined && response.status >= 200 && response.status < 300) {
    await cache.set(key, response);
  }

  return response;
};

export function patchCacheInterceptors(axios: AxiosInstance, cache: Cache): () => void {
  const reqId = axios.interceptors.request.use(cacheRequest(cache));
  const resId = axios.interceptors.response.use(cacheResponse(cache));

  return () => {
    axios.interceptors.request.eject(reqId);
    axios.interceptors.response.eject(resId);
  };
}
