import axios, {AxiosInstance} from "axios";
import {createContext, useContext} from "react";
import wrap from './_hardcoded'

export const HttpClientContext = createContext<{ client: AxiosInstance }>({
  client: axios
})

export function createHttpClient(baseUrl: string) {
  const client = axios.create({
    baseURL: baseUrl
  });

  wrap(client)
  return client
}

export function useHttpClient(): AxiosInstance {
  const {client} = useContext(HttpClientContext)
  return client
}
