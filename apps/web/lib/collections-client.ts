'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { API_SERVER } from '@/utils/api';

export interface CollectionQueryResponse<T> {
  query: string;
  params: Record<string, any>;
  data: T[];
  requestedAt: string;
  finishedAt?: string;
  spent: number;
  sql: string;
  fields: Array<{
    name: string;
    columnType: number;
  }>;
}

export interface CollectionExplainResponse {
  query: string;
  params: Record<string, any>;
  data: Array<Record<string, any>>;
  fields: Array<{
    name: string;
    columnType?: number;
  }>;
  requestedAt: string;
  finishedAt: string;
  sql: string;
}

export interface CollectionAsyncData<T> {
  data: T | undefined;
  loading: boolean;
  hasLoaded: boolean;
  error: unknown | undefined;
  reload: () => Promise<void>;
}

export async function fetchCollectionApi<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_SERVER}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`Collections API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export function getCollectionApiQueryKey(path: string | null) {
  return ['collections-api', path] as const;
}

export function useCollectionApi<T>(
  path: string | null,
  shouldLoad: boolean = true,
  initialData?: T,
): CollectionAsyncData<T> {
  const queryResult = useQuery({
    queryKey: getCollectionApiQueryKey(path),
    queryFn: ({ signal }) => fetchCollectionApi<T>(path!, signal),
    enabled: Boolean(path) && shouldLoad,
    placeholderData: keepPreviousData,
    ...(initialData !== undefined ? { initialData } : {}),
  });

  return {
    data: queryResult.data,
    loading: queryResult.isPending && !queryResult.data,
    hasLoaded: queryResult.isFetched || queryResult.isRefetchError,
    error: queryResult.error,
    reload: async () => {
      await queryResult.refetch();
    },
  };
}
