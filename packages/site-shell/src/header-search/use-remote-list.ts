'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useDebouncedValue } from './use-debounced-value';

export interface UseRemoteListOptions<Item> {
  getRemoteOptions: (text: string, signal?: AbortSignal) => Promise<Item[]>;
  queryKeyPrefix?: readonly unknown[];
  debounceMs?: number;
  staleTime?: number;
}

const DEFAULT_QUERY_KEY_PREFIX = ['remote-list'] as const;

export function useRemoteList<Item>({
  getRemoteOptions,
  queryKeyPrefix = DEFAULT_QUERY_KEY_PREFIX,
  debounceMs = 300,
  staleTime = 5 * 60 * 1000,
}: UseRemoteListOptions<Item>) {
  const [text, setText] = useState<string | null>(null);
  const debouncedText = useDebouncedValue(text, debounceMs);

  const queryResult = useQuery({
    queryKey: [...queryKeyPrefix, debouncedText ?? ''] as const,
    queryFn: ({ signal }) => getRemoteOptions(debouncedText ?? '', signal),
    enabled: debouncedText !== null,
    staleTime,
    placeholderData: keepPreviousData,
  });

  const reload = useCallback((value: string) => {
    setText(value);
  }, []);

  return {
    reload,
    items: queryResult.data ?? [],
    loading: queryResult.isPending && !queryResult.data,
    error: queryResult.error,
  };
}
