import React, { useMemo } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

function ClientRoot ({ children }) {
  const cache = useMemo(() => createCache({ key: 'css' }), []);
  return (
    <CacheProvider value={cache}>
      {children}
    </CacheProvider>
  );
}

function ServerRoot ({ children }) {
  return (
    <>{children}</>
  );
}

export default typeof window === 'undefined' ? ServerRoot : ClientRoot;
