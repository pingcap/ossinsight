declare module 'axios' {
  interface AxiosRequestConfig<D = any> {
    disableCache?: boolean;
    wsApi?: 'unique' | true | undefined;
    excludeMeta?: boolean;
    format?: 'compact';
  }
}

export {};
