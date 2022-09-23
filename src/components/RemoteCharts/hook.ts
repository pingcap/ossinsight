import {Queries} from "./queries";
import useSWR, { unstable_serialize } from "swr";
import Axios, { Canceler } from 'axios';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import InViewContext from "../InViewContext";
import { core } from '../../api';
import { clearPromiseInterval, setPromiseInterval } from "../../lib/promise-interval";
import { socket } from "../../api/client";
import { usePluginData } from "@docusaurus/core/lib/client/exports/useGlobalData";

export interface AsyncData<T> {
  data: T | undefined
  loading: boolean
  error: unknown | undefined
}

export interface RemoteData<P, T> {
  query: string
  params: P
  data: T[]
  requestedAt: string
  expiresAt: string
  spent: number
  sql: string
  fields: {
    name: string & keyof T
    columnType: number
  }[]
}

export interface BaseQueryResult<Params extends {
}, Data> {
  params: Params
  data: Data
}

interface UseRemoteData {
  <Q extends keyof Queries, P = Queries[Q]['params'], T = Queries[Q]['data']>(query: Q, params: P, formatSql: boolean, shouldLoad?: boolean, wsApi?: 'unique' | true | undefined): AsyncData<RemoteData<P, T>> & { reload?: () => Promise<void>}
  <P, T>(query: string, params: P, formatSql: boolean, shouldLoad?: boolean, wsApi?: 'unique' | true | undefined): AsyncData<RemoteData<P, T>> & { reload?: () => Promise<void>}
}

export const useRemoteData: UseRemoteData = (query: string, params: any, formatSql: boolean, shouldLoad: boolean = true, wsApi?: 'unique' | true | undefined): AsyncData<RemoteData<any, any>> & { reload: () => Promise<void>} => {
  const { inView } = useContext(InViewContext)
  const [data, setData] = useState(undefined)
  const [error, setError] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const cancelRef = useRef<Canceler>()
  const mounted = useRef(false)

  const serializedParams = unstable_serialize([query, params])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const reload = useCallback(async () => {
    try {
      if (!mounted.current) {
        return
      }
      setLoading(true)
      setError(undefined)
      setData(await core.query(query, params, {
        cancelToken:  new Axios.CancelToken(cancel => cancelRef.current = cancel),
        disableCache: wsApi && true,
        wsApi,
      }))
    } catch (e) {
      if (mounted.current) {
        setError(e)
      }
    } finally {
      if (mounted.current) {
        setLoading(false)
      }
    }
  }, [serializedParams])

  useEffect(() => {
    cancelRef.current?.()
    cancelRef.current = undefined
    setData(undefined)
    setError(undefined)
    setLoading(false)
    return () => {
      cancelRef.current?.()
    }
  }, [serializedParams])

  useEffect(() => {
    if (inView && shouldLoad && !data && !loading && !error) {
      reload()
    }
  }, [shouldLoad, inView, reload, data, !loading && !error])

  return {data, loading, error, reload}
}

export const useRealtimeRemoteData: UseRemoteData = (query: string, params: any, formatSql, shouldLoad = true, wsApi?: 'unique' | true | undefined): AsyncData<RemoteData<any, any>> => {
  const { inView } = useContext(InViewContext)

  const [data, setData] = useState(undefined)
  const [error, setError] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const cancelRef = useRef<Canceler>()
  const mounted = useRef(false)

  const serializedParams = unstable_serialize([query, params])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const reload = useCallback(async () => {
    try {
      if (!mounted.current) {
        return
      }
      setLoading(true)
      setError(undefined)
      setData(await core.query(query, params, {
        cancelToken:  new Axios.CancelToken(cancel => cancelRef.current = cancel),
        wsApi,
        disableCache: true,
        excludeMeta: true,
      }))
    } catch (e) {
      if (mounted.current) {
        setError(e)
      }
    } finally {
      if (mounted.current) {
        setLoading(false)
      }
    }
  }, [serializedParams])

  useEffect(() => {
    cancelRef.current?.()
    cancelRef.current = undefined
    setData(undefined)
    setError(undefined)
    setLoading(false)
    return () => {
      cancelRef.current?.()
    }
  }, [serializedParams])

  useEffect(() => {
    if (shouldLoad && inView) {
      reload()
      const h = setPromiseInterval(async () => {
        await reload()
      }, 5000)
      return () => {
        clearPromiseInterval(h)
      }
    }
  }, [shouldLoad, inView, reload])

  return {data, loading, error}
}

export const useTotalEvents = (run: boolean, interval = 1000) => {
  const { eventsTotal } = usePluginData<{ eventsTotal: any }>('plugin-prefetch')

  const [total, setTotal] = useState(eventsTotal.data[0].cnt)
  const [added, setAdded] = useState(0)
  const lastTs = useRef(0)
  const cancelRef = useRef<() => void>()
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!run) {
      return
    }

    const reloadTotal = async () => {
      try {
        const { data: [{ cnt, latest_timestamp }] } = await core.queryWithoutCache('events-total', undefined)
        if (!mounted.current) {
          return
        }
        cancelRef.current?.()
        lastTs.current = latest_timestamp
        setTotal(cnt)
        setAdded(0)
        return () => {
          cancelRef.current?.()
        }
      } catch {}
    }

    const reloadAdded = async (first: boolean) => {
      try {
        if (lastTs.current) {
          const { data: [{ cnt, latest_created_at }] } = await core.queryWithoutCache('events-increment', { ts: lastTs.current }, {
            cancelToken: first ? undefined : new Axios.CancelToken(cancel => cancelRef.current = cancel),
            wsApi: 'unique',
          })
          if (!mounted.current) {
            return
          }
          setAdded(cnt)
        }
      } catch {}
    }

    const hTotal = setPromiseInterval(async () => {
      await reloadTotal()
    }, 60000)

    const hAdded = setPromiseInterval(async () => {
      await reloadAdded(false)
    }, interval)

    reloadTotal().then(() => reloadAdded(true))

    return () => {
      clearPromiseInterval(hTotal)
      clearPromiseInterval(hAdded)
    }
  }, [run])

  return total + added
}
