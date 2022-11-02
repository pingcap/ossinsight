import type { RepoInfo } from '@ossinsight/api';
import { AsyncData, RemoteData } from '../../../../../components/RemoteCharts/hook';
import { dangerousGetCtx } from '../_danger';
import { COMPARING_DATASET_ID, ORIGINAL_DATASET_ID } from '../dataset';
import { notNullish } from '@site/src/utils/value';

interface AnalyzeTemplateParams<T> {
  id: 'main' | 'vs';
  datasetId: typeof ORIGINAL_DATASET_ID | typeof COMPARING_DATASET_ID;
  repoInfo: RepoInfo | undefined;
  data: AsyncData<RemoteData<unknown, T>>;
  name: string;
  // be careful to use this
  context: Record<string, any>;
}

export function template<P, T = any> (fp: (params: AnalyzeTemplateParams<P>, i: number) => (T | T[])): T[] {
  const { repoName, comparingRepoName, repoInfo, comparingRepoInfo, data, compareData, context } = dangerousGetCtx<P>();
  let res: T[] = [];
  res = res.concat(fp({
    id: 'main',
    datasetId: ORIGINAL_DATASET_ID,
    repoInfo,
    data,
    name: repoName,
    context,
  }, 0));
  if (comparingRepoName) {
    res = res.concat(fp({
      id: 'vs',
      datasetId: COMPARING_DATASET_ID,
      repoInfo: comparingRepoInfo,
      data: compareData,
      name: comparingRepoName,
      context,
    }, 1));
  }
  return res;
}

export function simple<T> (single: T, comparing: T) {
  const { comparingRepoName } = dangerousGetCtx();
  if (comparingRepoName) {
    return comparing;
  } else {
    return single;
  }
}

export function aggregate<P, T = any> (fp: (all: Array<AsyncData<RemoteData<unknown, P>>>, name: string[]) => T): T {
  const { data, repoName, compareData, comparingRepoName } = dangerousGetCtx<P>();
  const res: Array<AsyncData<RemoteData<unknown, P>>> = [];
  const names: string[] = [];
  if (notNullish(data)) {
    res.push(data);
    names.push(repoName);
  }
  if (notNullish(compareData)) {
    res.push(compareData);
    names.push(comparingRepoName as string);
  }
  return fp(res, names);
}

export function min<P, K extends keyof P> (key: K): P[K] | undefined {
  const dates = aggregate<P>(all => {
    return all.flatMap(data => data.data?.data?.[0]?.[key] ?? []);
  });

  if (dates.length >= 2) {
    return dates[0] < dates[1] ? dates[0] : dates[1];
  } else if (dates.length === 1) {
    return dates[0];
  } else {
    return undefined;
  }
}

export function debugPrintOption () {
  const { context } = dangerousGetCtx();
  context.DEBUG_PRINT_OPTION = true;
}
