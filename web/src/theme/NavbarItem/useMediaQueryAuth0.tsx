import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useMediaQuery from '@mui/material/useMediaQuery';

export function useMediaQueryAuth0 () {
  const { loginWithPopup, loginWithRedirect, ...others } = useAuth0();
  const matches = useMediaQuery('(min-width:600px)');

  const loginMemo = React.useMemo(() => {
    if (matches) {
      return loginWithPopup;
    } else {
      return loginWithRedirect;
    }
  }, [matches]);

  return { login: loginMemo, ...others };
}
