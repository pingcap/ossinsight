import {createContext, MutableRefObject, useContext} from 'react';
import {AsyncData, RemoteData} from '../components/RemoteCharts/hook';
import EChartsReact from 'echarts-for-react';

export interface AnalyzeChartContextProps<T = unknown> {
  title?: string
  description?: string
  hash?: string // url hash
  echartsRef?: MutableRefObject<EChartsReact>
  data: AsyncData<RemoteData<unknown, T>>
  compareData: AsyncData<RemoteData<unknown, T>>
}

const DEFAULT_DATA = { data: undefined, loading: false, error: undefined }

export const AnalyzeChartContext = createContext<AnalyzeChartContextProps>({
  title: undefined,
  hash: undefined,
  description: undefined,
  data: DEFAULT_DATA,
  compareData: DEFAULT_DATA,
})

export function useAnalyzeChartContext<T>(): AnalyzeChartContextProps<T> {
  return useContext(AnalyzeChartContext) as AnalyzeChartContextProps<T>
}

export interface AnalyzeContextProps {
  repoId?: number
  comparingRepoId?: number
}

export const AnalyzeContext = createContext<AnalyzeContextProps>({
  repoId: undefined,
  comparingRepoId: undefined,
})

export function useAnalyzeContext () {
  return useContext(AnalyzeContext)
}
