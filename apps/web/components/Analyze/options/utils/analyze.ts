import { AsyncData } from '@/utils/useRemoteData';
import { RemoteData } from '@/utils/api';
import { COMPARING_DATASET_ID, ORIGINAL_DATASET_ID } from '../dataset';
import { RepoInfo } from '../../context';

interface AnalyzeTemplateParams<T> {
  id: 'main' | 'vs';
  datasetId: typeof ORIGINAL_DATASET_ID | typeof COMPARING_DATASET_ID;
  repoInfo: RepoInfo | undefined;
  data: AsyncData<RemoteData<T>>;
  name: string;
  context: Record<string, any>;
}

// Global context for the dangerous pattern (same as legacy)
let _ctx: any = undefined;

export function dangerousSetCtx(ctx: any) {
  _ctx = ctx;
}

export function dangerousGetCtx<P = any>() {
  return _ctx as DangerousCtx<P>;
}

export interface DangerousCtx<T = any> {
  repoName: string;
  comparingRepoName?: string;
  repoId?: number;
  comparingRepoId?: number;
  repoInfo?: RepoInfo;
  comparingRepoInfo?: RepoInfo;
  data: AsyncData<RemoteData<T>>;
  compareData: AsyncData<RemoteData<T>>;
  query: string;
  title?: string;
  description?: string;
  hash?: string;
  context: Record<string, any>;
  width: number;
  height: number;
  isSmall: boolean;
}

export function template<P, T = any>(
  fp: (params: AnalyzeTemplateParams<P>, i: number) => T | T[],
): T[] {
  const { repoName, comparingRepoName, repoInfo, comparingRepoInfo, data, compareData, context } =
    dangerousGetCtx<P>();
  let res: T[] = [];
  res = res.concat(
    fp(
      {
        id: 'main',
        datasetId: ORIGINAL_DATASET_ID,
        repoInfo,
        data,
        name: repoName,
        context,
      },
      0,
    ),
  );
  if (comparingRepoName) {
    res = res.concat(
      fp(
        {
          id: 'vs',
          datasetId: COMPARING_DATASET_ID,
          repoInfo: comparingRepoInfo,
          data: compareData,
          name: comparingRepoName,
          context,
        },
        1,
      ),
    );
  }
  return res;
}

export function aggregate<P, T = any>(
  fp: (all: Array<AsyncData<RemoteData<P>>>, names: string[]) => T,
): T {
  const { data, repoName, compareData, comparingRepoName } = dangerousGetCtx<P>();
  const res: Array<AsyncData<RemoteData<P>>> = [];
  const names: string[] = [];
  if (data != null) {
    res.push(data);
    names.push(repoName);
  }
  if (compareData != null) {
    res.push(compareData);
    names.push(comparingRepoName as string);
  }
  return fp(res, names);
}

export function adjustAxis(
  data: any[],
  groups: string[][],
): Array<{ min: number; max: number }> {
  return groups.map((keys) => {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    for (const item of data) {
      for (const key of keys) {
        const v = item[key];
        if (v != null) {
          min = Math.min(min, v);
          max = Math.max(max, v);
        }
      }
    }
    return { min, max };
  });
}
