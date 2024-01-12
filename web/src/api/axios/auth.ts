import { AxiosError, AxiosInstance } from 'axios';
import { isAxiosError } from '@site/src/utils/error';
import { isFalsy, notFalsy, notNullish } from '@site/src/utils/value';

declare module 'axios' {
  interface AxiosRequestConfig {
    oToken?: string;
  }
}

export enum AuthFailedReason {
  unauthorized = 'unauthorized',
  forbidden = 'forbidden',
  outdated = 'outdated',
}

const KEY_AUTH_FAILED_REASON = 'authFailedReason';

export interface AuthError extends AxiosError {
  [KEY_AUTH_FAILED_REASON]: AuthFailedReason;
}

export function isAuthError (e: AxiosError): e is AuthError {
  return KEY_AUTH_FAILED_REASON in e;
}

export function patchAuthInterceptors (axios: AxiosInstance): () => void {
  const req = axios.interceptors.request.use(config => {
    if ('oToken' in config) {
      config.withCredentials = true;
    }
    if (notFalsy(config.oToken)) {
      const headers = config.headers = config.headers ?? {};
      if (isFalsy(headers.Authorization)) {
        headers.Authorization = `Bearer ${config.oToken}`;
      }
    }
    return config;
  });
  const resp = axios.interceptors.response.use(undefined, async (e) => {
    if (isAxiosError(e) && notNullish(e.response)) {
      let reason: AuthFailedReason | undefined;
      switch (e.response.status) {
        case 401:
          reason = AuthFailedReason.unauthorized;
          break;
        case 403:
          reason = AuthFailedReason.forbidden;
          break;
      }
      if (reason) {
        (e as AuthError)[KEY_AUTH_FAILED_REASON] = reason;
      }
    }
    return await Promise.reject(e);
  });

  return () => {
    axios.interceptors.request.eject(req);
    axios.interceptors.response.eject(resp);
  };
}
