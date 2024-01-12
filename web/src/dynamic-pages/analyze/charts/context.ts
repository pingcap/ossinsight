import { createContext, MutableRefObject, RefCallback, useContext } from 'react';
import { AsyncData, RemoteData } from '../../../components/RemoteCharts/hook';
import type EChartsReact from 'echarts-for-react';
import type { RepoInfo } from '@ossinsight/api';
import { isEmptyArray } from '@site/src/utils/value';

export interface AnalyzeChartContextProps<T = unknown> {
  query: string;
  title?: string;
  description?: string;
  hash?: string; // url hash
  echartsRef?: MutableRefObject<EChartsReact>;
  data: AsyncData<RemoteData<unknown, T>>;
  compareData: AsyncData<RemoteData<unknown, T>>;
  headingRef?: RefCallback<HTMLHeadingElement>;
  descriptionRef?: RefCallback<HTMLParagraphElement>;
}

const DEFAULT_DATA = { data: undefined, loading: false, error: undefined };

export const AnalyzeChartContext = createContext<AnalyzeChartContextProps>({
  query: '',
  title: undefined,
  hash: undefined,
  description: undefined,
  data: DEFAULT_DATA,
  compareData: DEFAULT_DATA,
  headingRef: undefined,
  descriptionRef: undefined,
});

export function useAnalyzeChartContext<T> (): AnalyzeChartContextProps<T> {
  return useContext(AnalyzeChartContext) as AnalyzeChartContextProps<T>;
}

export interface AnalyzeContextProps {
  repoName: string;
  comparingRepoName?: string;
  repoId?: number;
  comparingRepoId?: number;
  repoInfo?: RepoInfo;
  comparingRepoInfo?: RepoInfo;
}

export const AnalyzeContext = createContext<AnalyzeContextProps>({
  repoName: '',
  comparingRepoName: undefined,
  repoId: undefined,
  comparingRepoId: undefined,
  repoInfo: undefined,
  comparingRepoInfo: undefined,
});

export function useAnalyzeContext () {
  return useContext(AnalyzeContext);
}

export function isNoData (ctx: AnalyzeChartContextProps) {
  if (ctx.data.loading || ctx.compareData.loading) {
    return false;
  }
  return isEmptyArray(ctx.data.data?.data) && isEmptyArray(ctx.compareData.data?.data);
}
