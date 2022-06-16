import { debounce } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { createHttpClient } from '../../lib/request';
import { AsyncData } from '../RemoteCharts/hook';

const httpClient = createHttpClient();

export interface Repo extends Record<string, unknown> {
  id: number
  name: string
}

function useDebounced<T>(value: T, wait?: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const wrappedSetDebouncedValue = useCallback(debounce(setDebouncedValue, wait), [wait]);

  useEffect(() => {
    wrappedSetDebouncedValue(value);
    return wrappedSetDebouncedValue.clear;
  }, [value]);

  return debouncedValue;
}

export function useSearchRepo(keyword: string): AsyncData<Repo[]> {

  const searchKey = useDebounced(keyword, 500);

  const {
    data,
    isValidating: loading,
    error,
  } = useSWR<Repo[]>(searchKey ? [searchKey, 'search'] : undefined, {
    fetcher: async (keyword) => {
      const { data: { data } } = await httpClient.get(`/gh/repos/search`, { params: { keyword } });
      return data.map((r) => ({
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