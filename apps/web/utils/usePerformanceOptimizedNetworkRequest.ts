'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useShouldPerformNetworkRequests } from '@/utils/useShouldPerformNetworkRequests';

type AsyncFunctionWithSignal<Args extends any[], Result> = (
  ...args: [...Args, signal?: AbortSignal | undefined]
) => Promise<Result>;

export function usePerformanceOptimizedNetworkRequest<Args extends any[], Result>(
  fn: AsyncFunctionWithSignal<Args, Result>,
  ...args: Args
) {
  const { ref, value: shouldStartLoad } = useShouldPerformNetworkRequests();
  const argsKey = useMemo(() => JSON.stringify(args), [args]);

  const queryResult = useQuery({
    queryKey: ['performance-request', fn.name || 'anonymous', argsKey],
    queryFn: ({ signal }) => fn(...args, signal),
    enabled: shouldStartLoad,
    placeholderData: keepPreviousData,
  });

  return {
    result: queryResult.data,
    loading: shouldStartLoad && queryResult.isPending && !queryResult.data,
    error: queryResult.error,
    ref,
  };
}
