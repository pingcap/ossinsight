import React, { PropsWithChildren, useMemo } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

function ClientRoot ({ children }: PropsWithChildren) {
  const cache = useMemo(() => createCache({ key: 'css' }), []);
  return (
    <CacheProvider value={cache}>
      {children}
    </CacheProvider>
  );
}

function ServerRoot ({ children }: PropsWithChildren) {
  return (
    <>{children}</>
  );
}

export default typeof window === 'undefined' ? ServerRoot : ClientRoot;
