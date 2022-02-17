import axios from 'axios'
import {useEffect, useState} from "react";
import {format} from "sql-formatter";
import {Queries} from "./queries";

const BASE = 'https://community-preview-contributor.tidb.io'
// const BASE = 'http://localhost:3450'

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
  n: number
  repo: string
}, Data> {
  params: Params
  data: Data
}

export const useRemoteData = <Q extends keyof Queries, P = Queries[Q]['params'], T = Queries[Q]['data']>(query: Q, params: P): AsyncData<RemoteData<P, T>> => {
  const [data, setData] = useState<RemoteData<P, T>>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    setData(undefined)
    setError(undefined)
    setLoading(true)
    axios.get(`/q/${query}`, {baseURL: BASE, params})
      .then(({data}) => {
        if (data.sql) {
          data.sql = format(data.sql)
        }
        setData(data)
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [JSON.stringify(params)])

  return {data, loading, error}
}
