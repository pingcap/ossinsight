import {useEffect, useState} from "react";
import {format} from "sql-formatter";
import {Queries} from "./queries";
import {createHttpClient} from "../../lib/request";
import useSWR from "swr";

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

  const { data, isValidating: loading, error } = useSWR(shouldLoad ? [query, params] : null, {
    fetcher: (query, params) => httpClient.get(`/q/${query}`, {params})
      .then(({data}) => {
        if (data.sql && formatSql) {
          data.sql = format(data.sql)
        }
        return data
      }),
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })

  return {data, loading, error}
}
