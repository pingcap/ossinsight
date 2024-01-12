declare module 'axios' {
  interface AxiosRequestConfig {
    disableCache?: boolean;
    wsApi?: 'unique' | boolean | undefined;
    excludeMeta?: boolean;
    format?: 'compact';
  }
}

export {};
