import React, { createContext, createElement, PropsWithChildren, useContext } from 'react';
import { useUserInfo } from '@site/src/api/user';
import { Auth0Provider } from '@auth0/auth0-react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

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

  return (
    <Auth0Provider
      domain={customFields?.auth0_domain as string}
      clientId={customFields?.auth0_client_id as string}
      redirectUri={url}
      audience={`https://${customFields?.auth0_domain as string}/api/v2/`}
      scope="read:current_user"
    >
      {children}
    </Auth0Provider>
  );
}
