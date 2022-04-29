import {RepoInfo} from '../../../api/gh';
import {AsyncData, RemoteData} from '../../../components/RemoteCharts/hook';
import {dangerousGetCtx} from '../_danger';
import {COMPARING_DATASET_ID, ORIGINAL_DATASET_ID} from '../dataset';



interface AnalyzeTemplateParams<T> {
  id: 'main' | 'vs'
  datasetId: typeof ORIGINAL_DATASET_ID | typeof COMPARING_DATASET_ID
  repoInfo: RepoInfo | undefined;
  data: AsyncData<RemoteData<unknown, T>>;
  name: string;
  // be careful to use this
  context: Record<string, any>
}

export function template<P, T = any>(fp: (params: AnalyzeTemplateParams<P>) => (T | T[])): T[] {
  const {repoName, comparingRepoName, repoInfo, comparingRepoInfo, data, compareData, context} = dangerousGetCtx<P>();
  let res: T[] = [];
  res = res.concat(fp({
    id: 'main',
    datasetId: ORIGINAL_DATASET_ID,
    repoInfo,
    data,
    name: repoName,
    context,
  }));
  if (comparingRepoName) {
    res = res.concat(fp({
      id: 'vs',
      datasetId: COMPARING_DATASET_ID,
      repoInfo: comparingRepoInfo,
      data: compareData,
      name: comparingRepoName,
      context,
    }));
  }
  return res;
}

export function simple<T>(single: T, comparing: T) {
  const {comparingRepoName} = dangerousGetCtx();
  if (comparingRepoName) {
    return comparing;
  } else {
    return single;
  }
}