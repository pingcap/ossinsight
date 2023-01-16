import { useAuth0 } from '@auth0/auth0-react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useMemoizedFn } from 'ahooks';
import { BaseLoginOptions } from '@auth0/auth0-spa-js';
// import { Theme } from '@mui/material/styles';

declare global {
  function gtag (
    command: string,
    fields: string,
    params: any,
  ): void;
}

interface LoginMethodOptions extends BaseLoginOptions {
  triggerBy?: string;
}

type LoginMethod = (options?: LoginMethodOptions) => Promise<void>;

export function useResponsiveAuth0 () {
  const { loginWithPopup, loginWithRedirect, ...others } = useAuth0();
  // const matches = useMediaQuery((theme: Theme) => theme?.breakpoints.up('md'));
  const matches = useMediaQuery('(min-width:600px)');

  const redirectLoginWithState: LoginMethod = useMemoizedFn(async (options) => {
    const path =
      typeof window !== 'undefined'
        ? window.location.href.replace(window.location.origin, '')
        : '';
    return await loginWithRedirect({
      ...options,
      appState: { returnTo: path },
    });
  });

  const login: LoginMethod = useMemoizedFn(async ({ triggerBy, ...options }: LoginMethodOptions = {}) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'trigger_login', {
        trigger_login_by: triggerBy,
      });
    }
    if (matches) {
      return await loginWithPopup(options);
    } else {
      return await redirectLoginWithState(options);
    }
  });

  return { login, ...others };
}
