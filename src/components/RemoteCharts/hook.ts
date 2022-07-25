import {Queries} from "./queries";
import useSWR, { unstable_serialize } from "swr";
import Axios, { Canceler } from 'axios';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import InViewContext from "../InViewContext";
import { core } from '../../api';
import { clearPromiseInterval, setPromiseInterval } from "../../lib/promise-interval";

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
  <Q extends keyof Queries, P = Queries[Q]['params'], T = Queries[Q]['data']>(query: Q, params: P, formatSql: boolean, shouldLoad?: boolean): AsyncData<RemoteData<P, T>>
  <P, T>(query: string, params: P, formatSql: boolean, shouldLoad?: boolean): AsyncData<RemoteData<P, T>>
}

export const useRemoteData: UseRemoteData = (query: string, params: any, formatSql: boolean, shouldLoad: boolean = true): AsyncData<RemoteData<any, any>> & { reload: () => Promise<void>} => {
  const { inView } = useContext(InViewContext)
  const [data, setData] = useState(undefined)
  const [error, setError] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const cancelRef = useRef<Canceler>()

  const serializedParams = unstable_serialize([query, params])

  const reload = useCallback(async () => {
    try {
      setLoading(true)
      setError(undefined)
      setData(await core.query(query, params, {
        cancelToken:  new Axios.CancelToken(cancel => cancelRef.current = cancel)
      }))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [serializedParams])

  useEffect(() => {
    cancelRef.current?.()
    cancelRef.current = undefined
    setData(undefined)
    setError(undefined)
    setLoading(false)
  }, [serializedParams])

  useEffect(() => {
    if (inView && shouldLoad && !data && !loading && !error) {
      reload()
    }
  }, [shouldLoad, inView, reload, data, loading && !error])

  return {data, loading, error, reload}
}

export const useRealtimeRemoteData: UseRemoteData = (query: string, params: any, formatSql, shouldLoad = true): AsyncData<RemoteData<any, any>> => {
  const { inView } = useContext(InViewContext)
  const [viewed, setViewed] = useState(inView)

  useEffect(() => {
    if (inView) {
      setViewed(true)
    }
  }, [inView])

  const { data, isValidating: loading, error, mutate } = useSWR(shouldLoad && viewed ? [query, params, 'q'] : null, {
    fetcher: core.query,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  useEffect(() => {
    if (shouldLoad && viewed) {
      const h = setPromiseInterval(async () => {
        await mutate()
      }, 5000)
      return () => {
        clearPromiseInterval(h)
      }
    }
  }, [shouldLoad, viewed])

  return {data, loading, error}
}

export const useTotalEvents = (run: boolean, interval = 1000) => {
  const [total, setTotal] = useState(0)
  const [added, setAdded] = useState(0)
  const lastTs = useRef(0)
  const cancelRef = useRef<() => void>()

  useEffect(() => {
    if (!run) {
      return
    }

    const reloadTotal = async () => {
      try {
        const { data: [{ cnt, latest_timestamp }] } = await core.query('events-total')
        cancelRef.current?.()
        lastTs.current = latest_timestamp
        setTotal(cnt)
        setAdded(0)
      } catch {}
    }

    const reloadAdded = async (first: boolean) => {
      try {
        if (lastTs.current) {
          const { data: [{ cnt, latest_created_at }] } = await core.query('events-increment', { ts: lastTs.current }, {
            cancelToken: first ? undefined : new Axios.CancelToken(cancel => cancelRef.current = cancel)
          })
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
