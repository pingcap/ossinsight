import React, { createContext, createElement, PropsWithChildren, useContext } from 'react';
import { useUserInfo } from '@site/src/api/user';
import { AppState, Auth0Provider } from '@auth0/auth0-react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useMemoizedFn } from 'ahooks';
import { useResponsiveAuth0 } from '@site/src/theme/NavbarItem/useResponsiveAuth0';
import { useHistory } from '@docusaurus/router';
import { useGtag } from '@site/src/utils/ga';

const UserContext = createContext<ReturnType<typeof useUserInfo>>({
  validated: false,
  validating: false,
  userInfo: undefined,
  login: () => {},
  logout: () => {},
  mutate: async () => undefined,
  oToken: undefined,
});

export function UserInfoProvider ({ children }: PropsWithChildren) {
  return createElement(UserContext.Provider, { value: useUserInfo() }, children);
}

export function useUserInfoContext () {
  return useContext(UserContext);
}

export function AuthProvider ({ children }: PropsWithChildren): JSX.Element {
  const {
    siteConfig: { customFields, url },
  } = useDocusaurusContext();
  const history = useHistory();

  const onRedirectCallback = (appState: AppState) => {
    if (appState?.returnTo) {
      history.push(appState.returnTo);
    }
  };

  return (
    <Auth0Provider
      domain={customFields?.auth0_domain as string}
      clientId={customFields?.auth0_client_id as string}
      redirectUri={
        typeof window === 'undefined' ? url : window.location.origin || url
      }
      onRedirectCallback={onRedirectCallback}
      audience={`https://${customFields?.auth0_domain as string}/api/v2/`}
      scope="read:current_user"
      // https://auth0.com/docs/troubleshoot/authentication-issues/renew-tokens-when-using-safari
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}

export function useRequireLogin (): (triggerByLabel?: string) => Promise<string> {
  const { isLoading, user, login, getAccessTokenSilently } = useResponsiveAuth0();
  const { gtagEvent } = useGtag();

  return useMemoizedFn(async (triggerByLabel) => {
    if (!isLoading && !user) {
      await login({ triggerBy: triggerByLabel });
      try {
        const token = await getAccessTokenSilently();
        gtagEvent('login_success', { trigger_login_by: triggerByLabel });
        return token;
      } catch {
        gtagEvent('login_fail', { trigger_login_by: triggerByLabel });
        throw new Error('reject login');
      }
    } else {
      return await getAccessTokenSilently();
    }
  });
}
