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

function Inner () {
  const { getAccessTokenSilently } = useResponsiveAuth0();
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
          redirect_uri: location.origin + '/open-source-heroes/tidbcloud/oauth/callback',
        }),
      });

      if (response.ok) {
        gtagEvent('connect_tidb_cloud_succeed', {});
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        gtagEvent('connect_tidb_cloud_failed', {});
        setError(await response.json());
      }
    };

    void execute();
  }, []);

  if (!error) {
    return <div style={{ width: '100vw', height: '100vh', lineHeight: '100vh', textAlign: 'center' }}>Authorizing...</div>;
  }

  return <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
    <h3>{error.error}</h3>
    <div>{error.message}</div>
  </div>;
}
