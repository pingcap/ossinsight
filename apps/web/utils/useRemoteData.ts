'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryAPI, RemoteData } from './api';

export interface AsyncData<T> {
  data: T | undefined;
  loading: boolean;
  error: unknown | undefined;
}

function normalizeParams(params: Record<string, any> | undefined) {
  if (!params) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value != null)
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function getRemoteDataQueryKey(
  query: string,
  params: Record<string, any> | undefined,
) {
  return ['remote-data', query, normalizeParams(params)] as const;
}

export function useRemoteData<T = any>(
  query: string,
  params: Record<string, any> | undefined,
  shouldLoad: boolean = true,
): AsyncData<RemoteData<T>> & { reload: () => Promise<void> } {
  const queryResult = useQuery({
    queryKey: getRemoteDataQueryKey(query, params),
    queryFn: ({ signal }) => queryAPI<T>(query, params, signal),
    enabled: shouldLoad,
    placeholderData: keepPreviousData,
  });

  return {
    data: queryResult.data,
    loading: queryResult.isPending && !queryResult.data,
    error: queryResult.error,
    reload: async () => {
      await queryResult.refetch();
    },
  };
}
