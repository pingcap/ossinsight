'use client';

import { ColorSchemeProvider } from '@/lib/ui/components/ColorScheme';
import { PropsWithChildren } from 'react';

export function Providers ({ children }: PropsWithChildren) {
  return (
    <ColorSchemeProvider>
      {children}
    </ColorSchemeProvider>
  );
}
