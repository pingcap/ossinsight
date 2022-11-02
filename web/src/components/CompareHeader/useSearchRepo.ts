import { debounce } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { core } from '../../api';
import { AsyncData } from '../RemoteCharts/hook';

export interface Repo extends Record<string, unknown> {
  id: number;
  name: string;
}

export function useDebounced<T> (value: T, wait?: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const wrappedSetDebouncedValue = useCallback(debounce(setDebouncedValue, wait), [wait]);

  useEffect(() => {
    wrappedSetDebouncedValue(value);
    return wrappedSetDebouncedValue.clear;
  }, [value]);

  return debouncedValue;
}

export function useSearchRepo (keyword: string): AsyncData<Repo[]> {
  const searchKey = useDebounced(keyword, 500);

  const {
    data,
    isValidating: loading,
    error,
  } = useSWR<Repo[]>(searchKey ? [searchKey, 'search:repo:old'] : undefined, {
    fetcher: async (keyword) => {
      const list = await core.searchRepo(keyword);
      return list.map((r) => ({
        id: r.id,
        name: r.fullName,
      }));
    },
    fallbackData: [],
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    data: data ?? [],
    loading,
    error,
  };
}
