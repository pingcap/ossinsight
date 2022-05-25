import {format} from "sql-formatter";
import {Queries} from "./queries";
import {createHttpClient} from "../../lib/request";
import useSWR from "swr";
import {AxiosRequestConfig} from "axios";
import {useContext, useEffect, useState} from "react";
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
