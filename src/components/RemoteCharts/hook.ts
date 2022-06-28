import { usePluginData } from '@docusaurus/useGlobalData';
import {Queries} from "./queries";
import useSWR from "swr";
import Axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import InViewContext from "../InViewContext";
import { core } from '../../api';

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

export const useRemoteData: UseRemoteData = (query: string, params: any, formatSql: boolean, shouldLoad: boolean = true): AsyncData<RemoteData<any, any>> => {
  const { inView } = useContext(InViewContext)
  const [viewed, setViewed] = useState(inView)

  useEffect(() => {
    if (inView) {
      setViewed(true)
    }
  }, [inView])

  const { data, isValidating: loading, error } = useSWR(shouldLoad && viewed ? [query, params, 'q'] : null, {
    fetcher: core.query,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })

  return {data, loading, error}
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
      const h = setInterval(() => {
        mutate()
      }, 5000)
      return () => {
        clearInterval(h)
      }
    }
  }, [shouldLoad, viewed])

  return {data, loading, error}
}

export const useTotalEvents = (run: boolean, interval = 1000) => {
  const {eventsTotal} = usePluginData<{eventsTotal: RemoteData<any, { cnt: number, latest_timestamp: number }>}>('plugin-prefetch');

  const [total, setTotal] = useState(eventsTotal?.data[0].cnt)
  const [added, setAdded] = useState(0)
  const lastTs = useRef(eventsTotal?.data[0].latest_timestamp)
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

    const hTotal = setInterval(() => {
      reloadTotal().then()
    }, 60000)

    const hAdded = setInterval(() => {
      reloadAdded(false).then()
    }, interval)

    reloadTotal().then()
    reloadAdded(true).then()

    return () => {
      clearInterval(hTotal)
      clearInterval(hAdded)
    }
  }, [run])

  return total + added
}
