import { usePluginData } from '@docusaurus/useGlobalData';
import {format} from "sql-formatter";
import { Collection } from '../../dynamic-pages/collections/hooks/useCollection';
import {Queries} from "./queries";
import {createHttpClient} from "../../lib/request";
import useSWR from "swr";
import Axios, { AxiosRequestConfig, CancelToken } from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import InViewContext from "../InViewContext";

const httpClient = createHttpClient();

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

function paramsSerializer (params: any): string {
  const usp = new URLSearchParams()
  for (let [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach(item => usp.append(key, item))
    } else {
      usp.set(key, String(value))
    }
  }
  return usp.toString()
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
    fetcher: (query, params) => httpClient.get(`/q/${query}`, {params, paramsSerializer })
      .then(({data}) => {
        if (data.sql && formatSql) {
          data.sql = format(data.sql)
        }
        data.query = query
        return data
      }),
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
    fetcher: (query, params) => httpClient.get(`/q/${query}`, {params, paramsSerializer })
      .then(({data}) => {
        if (data.sql && formatSql) {
          data.sql = format(data.sql)
        }
        data.query = query
        return data
      }),
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

interface CheckReq {
  (config: AxiosRequestConfig): boolean
}

export function registerStaticData(checkReq: CheckReq, data: any) {
  httpClient.interceptors.request.use(config => {
    if (!checkReq(config)) {
      return config
    }
    config.adapter = async () => {
      return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {'x-registered': 'true'},
        config
      }
    }
    return config
  })
}

export const query = (query: string, validateParams: (check: AxiosRequestConfig['params']) => boolean): CheckReq => {
  return (config) => {
    if (config.url !== `/q/${query}`) {
      return false
    } else {
      return validateParams(config.params)
    }
  }
}

const toTs = date => {
  if (typeof date !== 'number') {
    return Math.round((new Date(date)).getTime() / 1000)
  }
  return date
}

export const useTotalEvents = (run: boolean) => {
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
        const { data: { data: [{ cnt, latest_timestamp }] } } = await httpClient.get('/q/events-total')
        cancelRef.current?.()
        lastTs.current = latest_timestamp
        setTotal(cnt)
        setAdded(0)
      } catch {}
    }

    const reloadAdded = async () => {
      try {
        if (lastTs.current) {
          const { data: { data: [{ cnt, latest_created_at }] } } = await httpClient.get('/q/events-increment', { params: { ts: lastTs.current }, cancelToken: new Axios.CancelToken(cancel => cancelRef.current = cancel) })
          setAdded(cnt)
        }
      } catch {}
    }

    const hTotal = setInterval(() => {
      reloadTotal().then()
    }, 60000)

    const hAdded = setInterval(() => {
      reloadAdded().then()
    }, 1000)

    reloadTotal().then()
    reloadAdded().then()

    return () => {
      clearInterval(hTotal)
      clearInterval(hAdded)
    }
  }, [run])

  return total + added
}
