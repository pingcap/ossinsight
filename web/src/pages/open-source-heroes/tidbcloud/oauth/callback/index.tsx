import { AuthProvider } from '@site/src/context/user';
import { useResponsiveAuth0 } from '@site/src/theme/NavbarItem/useResponsiveAuth0';
import { useGtag } from '@site/src/utils/ga';
import React, { useEffect, useState } from 'react';

export default function Page () {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
}

enum AuthorizeState {
  AUTHORIZING,
  AUTHORIZED,
  FAILED,
}

function Inner () {
  const { getAccessTokenSilently } = useResponsiveAuth0();
  const [authorizeState, setAuthorizeState] = useState(AuthorizeState.AUTHORIZING);
  const [error, setError] = useState<{ error: string, message: string }>();
  const { gtagEvent } = useGtag();

  useEffect(() => {
    const execute = async () => {
      const token = await getAccessTokenSilently();

      const usp = new URLSearchParams(window.location.search);
      const code = usp.get('code');
      const state = usp.get('state');

      const AUTH_URL = `${process.env.GIFT_APP_API_BASE as string}/api/v1/serverless-credits-campaign/oauth/tidbcloud/callback`;

      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          state,
          redirect_uri: location.origin + '/open-source-heroes/tidbcloud/oauth/callback/',
        }),
      });

      if (response.ok) {
        gtagEvent('connect_tidb_cloud_succeed', {});
        setAuthorizeState(AuthorizeState.AUTHORIZED);
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        gtagEvent('connect_tidb_cloud_failed', {});
        setAuthorizeState(AuthorizeState.FAILED);
        setError(await response.json());
      }
    };

    void execute();
  }, []);

  switch (authorizeState) {
    case AuthorizeState.AUTHORIZING:
      return <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
        <h3>Authorizing</h3>
        <div>Please do not close this window.</div>
      </div>;
    case AuthorizeState.AUTHORIZED:
      return <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
        <h3>Authorized</h3>
        <div>This window will close in seconds. Go back to <span onClick={() => window.close()} style={{ textDecoration: 'underline' }}>OSSInsight</span>.</div>
      </div>;
    case AuthorizeState.FAILED:
      return <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
        <h3>{error?.error ?? 'Authorization failed'}</h3>
        <div>{error?.message ?? 'Unknown error'}</div>
      </div>;
  }
}
