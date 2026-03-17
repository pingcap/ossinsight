'use client';

import { createContext, MutableRefObject, RefCallback, useContext } from 'react';
import { AsyncData } from '@/utils/useRemoteData';
import { RemoteData } from '@/utils/api';

export interface RepoInfo {
  id: number;
  full_name: string;
  description: string;
  language: string;
  license: string;
  forks: number;
  stars: number;
  owner: {
    login: string;
    avatar_url: string;
  };
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

export function useAnalyzeContext() {
  return useContext(AnalyzeContext);
}

export interface AnalyzeChartContextProps<T = unknown> {
  query: string;
  title?: string;
  description?: string;
  hash?: string;
  data: AsyncData<RemoteData<T>>;
  compareData: AsyncData<RemoteData<T>>;
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

export function useAnalyzeChartContext<T>(): AnalyzeChartContextProps<T> {
  return useContext(AnalyzeChartContext) as AnalyzeChartContextProps<T>;
}

export function isNoData(ctx: AnalyzeChartContextProps) {
  if (ctx.data.loading || ctx.compareData.loading) {
    return false;
  }
  const d1 = ctx.data.data?.data;
  const d2 = ctx.compareData.data?.data;
  return (!d1 || d1.length === 0) && (!d2 || d2.length === 0);
}
