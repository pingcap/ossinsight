'use client';

import { QueryClient } from '@tanstack/react-query';

const TEN_MINUTES = 10 * 60 * 1000;
const TWO_MINUTES = 2 * 60 * 1000;

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: TWO_MINUTES,
        gcTime: TEN_MINUTES,
        retry: 1,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getBrowserQueryClient() {
  if (!browserQueryClient) {
    browserQueryClient = createAppQueryClient();
  }

  return browserQueryClient;
}
