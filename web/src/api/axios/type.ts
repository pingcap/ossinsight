declare module 'axios' {
  interface AxiosRequestConfig {
    disableCache?: boolean;
    wsApi?: 'unique' | true | undefined;
    excludeMeta?: boolean;
    format?: 'compact';
  }
}

export {};
