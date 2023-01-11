import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useMediaQuery from '@mui/material/useMediaQuery';
// import { Theme } from '@mui/material/styles';

export function useResponsiveAuth0 () {
  const { loginWithPopup, loginWithRedirect, ...others } = useAuth0();
  // const matches = useMediaQuery((theme: Theme) => theme?.breakpoints.up('md'));
  const matches = useMediaQuery('(min-width:600px)');

  const redirectLoginWithState = async () => {
    const path =
      typeof window !== 'undefined'
        ? window.location.href.replace(window.location.origin, '')
        : '';
    return await loginWithRedirect({
      appState: { returnTo: path },
    });
  };

  const loginMemo = React.useMemo(() => {
    if (matches) {
      return loginWithPopup;
    } else {
      return redirectLoginWithState;
    }
  }, [matches]);

  return { login: loginMemo, ...others };
}
