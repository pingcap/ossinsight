import axios from 'axios'
import {useEffect, useState} from "react";
import {format} from "sql-formatter";

const BASE = 'https://community-preview-contributor.tidb.io'
// const BASE = 'http://localhost:3450'

export interface AsyncData<T> {
  data: T | undefined
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

export interface Queries extends Record<string, { params: any, data: any }> {
  'events-history': {
    params: {
      repo: string,
      event: string,
      n: number,
      years: number
    },
    data: {
      repo_name: number
      events_count: string
    }
  }
}

export const useRemoteData = <Q extends keyof Queries, P = Queries[Q]['params'], T = Queries[Q]['data']>(query: Q, params: P): AsyncData<RemoteData<P, T>> => {
  const [data, setData] = useState<RemoteData<P, T>>(undefined)
  const [error, setError] = useState<unknown>(undefined)

  useEffect(() => {
    setData(undefined)
    setError(undefined)
    axios.get(`/q/${query}`, { baseURL: BASE, params })
      .then(({ data }) => {
        if (data.sql) {
          data.sql = format(data.sql)
        }
        setData(data)
      })
      .catch(err => setError(err))
  }, [JSON.stringify(params)])

  return { data, error }
}
