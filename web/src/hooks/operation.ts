import { AsyncData } from '@site/src/components/RemoteCharts/hook';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWhenMounted } from '@site/src/hooks/mounted';
import { unstable_serialize } from 'swr';

interface AsyncOperation<T> extends AsyncData<T> {
  run: () => any;
}

export function useAsyncOperation<P, T> (params: P, fetcher: (params: P) => Promise<T>): AsyncOperation<T> {
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

  const run = useCallback(() => {
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
  }, []);

  return {
    data,
    loading,
    error,
    run,
  };
}
