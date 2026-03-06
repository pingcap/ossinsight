import { DependencyList, FC, PropsWithChildren, useMemo } from 'react';

export interface OnceProps {
  dependencies?: DependencyList;
}

const Once: FC<PropsWithChildren<OnceProps>> = function Once({ dependencies, children }) {
  return useMemo(() => <>{children}</>, dependencies ?? []);
};

Once.displayName = 'Once';

export default Once;
