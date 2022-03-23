import {AxiosInstance, AxiosRequestConfig} from "axios";

interface CheckReq {
  (config: AxiosRequestConfig): boolean
}

export function registerStaticData(httpClient: AxiosInstance, checkReq: CheckReq, data: any) {
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
