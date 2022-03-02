import {useEffect, useState} from "react";
import {format} from "sql-formatter";
import {Queries} from "./queries";
import {createHttpClient} from "../../lib/request";

const httpClient = createHttpClient();

export interface AsyncData<T> {
  data: T | undefined
  loading: boolean
  error: unknown | undefined
}

export interface RemoteData<P, T> {
  params: P
  data: T[]
  requestedAt: string
  expiresAt: string
  spent: number
  sql: string
}

export interface BaseQueryResult<Params extends {
}, Data> {
  params: Params
  data: Data
}

export const useRemoteData = <Q extends keyof Queries, P = Queries[Q]['params'], T = Queries[Q]['data']>(query: Q, params: P, formatSql: boolean, shouldLoad?: boolean): AsyncData<RemoteData<P, T>> => {
  const [data, setData] = useState<RemoteData<P, T>>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    // Notice: If shouldLoad is not set, it will also load by default.
    if (shouldLoad !== false && query != undefined) {
      setData(undefined)
      setError(undefined)
      setLoading(true)
      httpClient.get(`/q/${query}`, {params})
        .then(({data}) => {
          if (data.sql && formatSql) {
            data.sql = format(data.sql)
          }
          setData(data)
        })
        .catch(err => setError(err))
        .finally(() => setLoading(false))
    }
  }, [JSON.stringify(params)])

  return {data, loading, error}
}
