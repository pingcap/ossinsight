import axios, { AxiosRequestConfig } from 'axios';
import { createSimpleCache, patchCacheInterceptors } from './axios/cache';
import io from 'socket.io-client';
import { transformCompactResponseInterceptor } from './axios/compact';

export const BASE_URL = (process.env.APP_API_BASE ?? '') || 'https://api.ossinsight.io';

function createClient (enableCache = true) {
  const client = axios.create({
    baseURL: BASE_URL,
    paramsSerializer: function paramsSerializer (params: any): string {
      const usp = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          value.forEach((item) => usp.append(key, item));
        } else {
          usp.set(key, String(value));
        }
      }
      return usp.toString();
    },
  });

  // we need to delete default 'Accept' header to match preload resources.
  delete client.defaults.headers.common.Accept;

  if (enableCache) {
    patchCacheInterceptors(client, createSimpleCache());
  }

  client.interceptors.response.use(transformCompactResponseInterceptor);
  client.interceptors.response.use((response) => {
    return response.data;
  });

  return client;
}

export const client = createClient();
export const clientWithoutCache = createClient(false);

type CheckReq = (config: AxiosRequestConfig) => boolean;

export function registerStaticData (checkReq: CheckReq, data: any) {
  client.interceptors.request.use(config => {
    if (!checkReq(config)) {
      return config;
    }
    config.adapter = async () => {
      return {
        data,
        status: 200,
        statusText: 'OK',
        headers: { 'x-registered': 'true' },
        config,
      };
    };
    return config;
  });
}

export const socket = io(BASE_URL, {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('socket connect');
});

socket.on('disconnect', () => {
  console.log('socket disconnect');
});
