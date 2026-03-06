import { createContext, MutableRefObject, RefCallback, useContext } from 'react';
import type EChartsReact from 'echarts-for-react';
import { AsyncData, RemoteData } from '../../../components/RemoteCharts/hook';

export interface AnalyzeUserChartContextProps<T = unknown> {
  query: string;
  title?: string;
  description?: string;
  hash?: string;
  echartsRef?: MutableRefObject<EChartsReact>;
  data: AsyncData<RemoteData<any, T>>;
  headingRef?: RefCallback<HTMLHeadingElement>;
  descriptionRef?: RefCallback<HTMLParagraphElement>;
}

export interface AnalyzeUserContextProps {
  login: string;
  userId?: number;
  loading: boolean;
  error?: unknown;
}

const DEFAULT_DATA = { data: undefined, loading: false, error: undefined };

const AnalyzeUserChartContext = createContext<AnalyzeUserChartContextProps>({
  query: '',
  data: DEFAULT_DATA,
});

const AnalyzeUserContext = createContext<AnalyzeUserContextProps>({
  login: '',
  loading: true,
});

export const AnalyzeUserChartContextProvider = AnalyzeUserChartContext.Provider;

export const AnalyzeUserContextProvider = AnalyzeUserContext.Provider;

export const useAnalyzeUserChartContext = () => {
  return useContext(AnalyzeUserChartContext);
};

export const useAnalyzeUserContext = () => {
  return useContext(AnalyzeUserContext);
};
