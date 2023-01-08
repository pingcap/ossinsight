import { createContext, createElement, PropsWithChildren, useContext } from 'react';
import { useUserInfo } from '@site/src/api/user';
import { useMemoizedFn } from 'ahooks';
import { isNullish } from '@site/src/utils/value';

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

export function useRequireLogin () {
  const { validating, userInfo, login } = useUserInfoContext();

  return useMemoizedFn(() => {
    if (validating) {
      return false;
    }
    if (isNullish(userInfo)) {
      login();
      return false;
    }
  });
}
