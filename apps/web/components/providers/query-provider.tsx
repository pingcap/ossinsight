'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { getBrowserQueryClient } from '@/lib/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getBrowserQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
