import { AsyncData } from '@site/src/components/RemoteCharts/hook';
import { useEffect, useRef, useState } from 'react';
import { useWhenMounted } from '@site/src/hooks/mounted';
import { unstable_serialize } from 'swr';
import { useUserInfoContext } from '@site/src/context/user';
import { useEventCallback } from '@mui/material';
import { notNullish } from '@site/src/utils/value';

interface AsyncOperation<T> extends AsyncData<T> {
  run: () => any;
  clear: () => any;
}

export function useAsyncState<T, E = unknown> (initial?: T | (() => T)) {
  const [data, setData] = useState<T | undefined>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<E>();

  const setAsyncData = useEventCallback((dataPromise: Promise<T>, clear: boolean = false) => {
    if (clear) {
      setData(undefined);
    }
    setLoading(true);
    setError(undefined);
    dataPromise
      .then(setData, setError)
      .finally(() => {
        setLoading(false);
      });
  });

  const clearState = useEventCallback(() => {
    if (notNullish(data)) {
      setData(undefined);
    }
    if (loading) {
      setLoading(false);
    }
    if (notNullish(error)) {
      setError(error);
    }
  });

  return {
    data,
    loading,
    error,
    setAsyncData,
    clearState,
  };
}

export function useAsyncOperation<P, T> (params: P, fetcher: (params: P) => Promise<T>, requireAuth: boolean = false): AsyncOperation<T> {
  const userInfo = useUserInfoContext();
  const whenMounted = useWhenMounted();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [data, setData] = useState<T>();
  const paramsRef = useRef(params);
  const fetcherRef = useRef(fetcher);
  const loadingRef = useRef(false);

  useEffect(() => {
    paramsRef.current = params;
    fetcherRef.current = fetcher;
    setLoading(false);
    setError(undefined);
    setData(undefined);
    loadingRef.current = false;
  }, [fetcher, unstable_serialize([params])]);

  const run = useEventCallback(() => {
    if (requireAuth && !userInfo.validated) {
      userInfo.login();
      return;
    }
    if (loadingRef.current) {
      return;
    }
    setLoading(true);
    setData(undefined);
    setError(undefined);
    loadingRef.current = true;
    fetcherRef.current(paramsRef.current)
      .then(whenMounted(setData))
      .catch(whenMounted(setError))
      .finally(whenMounted(() => {
        setLoading(false);
        loadingRef.current = false;
      }));
  });

  const clear = useEventCallback(() => {
    setData(undefined);
  });

  return {
    data,
    loading,
    error,
    run,
    clear,
  };
}
