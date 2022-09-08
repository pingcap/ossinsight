import axios, { AxiosRequestConfig } from 'axios';
import { createSimpleCache, patchCacheInterceptors } from "./axios/cache";
import io from "socket.io-client";

export const BASE_URL = process.env.APP_API_BASE || 'https://api.ossinsight.io';

export const client = axios.create({
  baseURL: BASE_URL,
  paramsSerializer: function paramsSerializer(params: any): string {
    const usp = new URLSearchParams();
    for (let [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach(item => usp.append(key, item));
      } else {
        usp.set(key, String(value));
      }
    }
    return usp.toString();
  },
});

patchCacheInterceptors(client, createSimpleCache());

client.interceptors.response.use(response => {
  return response.data;
});

interface CheckReq {
  (config: AxiosRequestConfig): boolean;
}

export function registerStaticData(checkReq: CheckReq, data: any) {
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

export const socket = io(BASE_URL);

socket.on("connect", () => {
  console.log(`socket connect`);
});

socket.on("disconnect", () => {
  console.log(`socket disconnect`);
});
