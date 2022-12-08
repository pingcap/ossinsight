import { createContext, createElement, PropsWithChildren, useContext } from 'react';
import { useUserInfo } from '@site/src/api/user';

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
