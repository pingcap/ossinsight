import { Queries } from './queries';
import { unstable_serialize } from 'swr';
import Axios, { Canceler } from 'axios';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import InViewContext from '../InViewContext';
import { core } from '../../api';
import { clearPromiseInterval, setPromiseInterval } from '../../lib/promise-interval';
import { usePluginData } from '@docusaurus/core/lib/client/exports/useGlobalData';
import { isNullish } from '@site/src/utils/value';

export interface AsyncData<T> {
  data: T | undefined;
  loading: boolean;
  error: unknown | undefined;
}

export interface RemoteData<P, T> {
  query: string;
  params: P;
  data: T[];
  requestedAt: string;
  expiresAt: string;
  spent: number;
  sql: string;
  fields: Array<{
    name: string & keyof T;
    columnType: number;
  }>;
}

export interface BaseQueryResult<Params extends {}, Data> {
  params: Params;
  data: Data;
}

interface UseRemoteData<Reloadable extends boolean> {
  <Q extends keyof Queries, P = Queries[Q]['params'], T = Queries[Q]['data']> (query: Q, params: P, formatSql: boolean, shouldLoad?: boolean, wsApi?: 'unique' | true | undefined): AsyncData<RemoteData<P, T>> & { reload?: () => Promise<void> };

  <P, T> (query: string, params: P, formatSql: boolean, shouldLoad?: boolean, wsApi?: 'unique' | true | undefined): AsyncData<RemoteData<P, T>> & (Reloadable extends true ? { reload: () => Promise<void> } : {});
}

export const useRemoteData: UseRemoteData<true> = (query: string, params: any, formatSql: boolean, shouldLoad: boolean = true, wsApi?: 'unique' | boolean | undefined): AsyncData<RemoteData<any, any>> & { reload: () => Promise<void> } => {
  const { inView } = useContext(InViewContext);
  const [data, setData] = useState<RemoteData<any, any>>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(false);
  const cancelRef = useRef<Canceler>();
  const mounted = useRef(false);

  const serializedParams = unstable_serialize([query, params]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    try {
      if (!mounted.current) {
        return;
      }
      setLoading(true);
      setError(undefined);
      setData(await core.query(query, params, {
        cancelToken: new Axios.CancelToken(cancel => { cancelRef.current = cancel; }),
        disableCache: wsApi != null,
        wsApi,
      }));
    } catch (e) {
      if (mounted.current) {
        setError(e);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [serializedParams]);

  useEffect(() => {
    cancelRef.current?.();
    cancelRef.current = undefined;
    setData(undefined);
    setError(undefined);
    setLoading(false);
    return () => {
      cancelRef.current?.();
    };
  }, [serializedParams]);

  useEffect(() => {
    if (inView && shouldLoad && isNullish(data) && !loading && isNullish(error)) {
      void reload();
    }
  }, [shouldLoad, inView, reload, data, !loading && isNullish(error)]);

  return { data, loading, error, reload };
};

export const useRealtimeRemoteData: UseRemoteData<false> = (query: string, params: any, formatSql, shouldLoad = true, wsApi?: 'unique' | true | undefined): AsyncData<RemoteData<any, any>> => {
  const { inView } = useContext(InViewContext);

  const [data, setData] = useState<RemoteData<any, any>>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(false);
  const cancelRef = useRef<Canceler>();
  const mounted = useRef(false);

  const serializedParams = unstable_serialize([query, params]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    try {
      if (!mounted.current) {
        return;
      }
      setLoading(true);
      setError(undefined);
      setData(await core.query(query, params, {
        cancelToken: new Axios.CancelToken(cancel => { cancelRef.current = cancel; }),
        wsApi,
        disableCache: true,
        excludeMeta: true,
        format: 'compact',
      }));
    } catch (e) {
      if (mounted.current) {
        setError(e);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [serializedParams]);

  useEffect(() => {
    cancelRef.current?.();
    cancelRef.current = undefined;
    setData(undefined);
    setError(undefined);
    setLoading(false);
    return () => {
      cancelRef.current?.();
    };
  }, [serializedParams]);

  useEffect(() => {
    if (shouldLoad && inView) {
      void reload();
      const h = setPromiseInterval(async () => {
        await reload();
      }, 5000);
      return () => {
        clearPromiseInterval(h);
      };
    }
  }, [shouldLoad, inView, reload]);

  return { data, loading, error };
};

export const useTotalEvents = (run: boolean, interval = 1000) => {
  const { eventsTotal } = usePluginData('plugin-prefetch') as { eventsTotal: RemoteData<any, { cnt: number }> };

  const [total, setTotal] = useState(eventsTotal.data[0].cnt);
  const [added, setAdded] = useState(0);
  const lastTs = useRef(0);
  const cancelRef = useRef<() => void>();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!run) {
      return;
    }

    const reloadTotal = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { data: [{ cnt, latest_timestamp }] } = await core.queryWithoutCache<{ cnt: number, latest_timestamp: number }>('events-total', undefined);
        if (!mounted.current) {
          return;
        }
        cancelRef.current?.();
        lastTs.current = latest_timestamp;
        setTotal(cnt);
        setAdded(0);
        return () => {
          cancelRef.current?.();
        };
      } catch {
      }
    };

    const reloadAdded = async (first: boolean) => {
      try {
        if (lastTs.current) {
          const { data: [{ cnt }] } = await core.queryWithoutCache<{ cnt: number, latest_created_at: number }>('events-increment', { ts: lastTs.current }, {
            cancelToken: first ? undefined : new Axios.CancelToken(cancel => { cancelRef.current = cancel; }),
            wsApi: 'unique',
          });
          if (!mounted.current) {
            return;
          }
          setAdded(cnt);
        }
      } catch {
      }
    };

    const hTotal = setPromiseInterval(async () => {
      await reloadTotal();
    }, 60000);

    const hAdded = setPromiseInterval(async () => {
      await reloadAdded(false);
    }, interval);

    void reloadTotal().then(async () => await reloadAdded(true));

    return () => {
      clearPromiseInterval(hTotal);
      clearPromiseInterval(hAdded);
    };
  }, [run]);

  return total + added;
};
