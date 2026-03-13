import type { DatasetOption } from 'echarts/types/dist/shared';
import { AsyncData } from '@/utils/useRemoteData';
import { RemoteData } from '@/utils/api';
import { template } from './utils/analyze';

export const ORIGINAL_DATASET_ID = 'original';
export const COMPARING_DATASET_ID = 'comparing';

export function originalDataset<T>(
  data: AsyncData<RemoteData<T>>,
  transform?: (items: T[]) => any,
): DatasetOption {
  return remoteDataset(ORIGINAL_DATASET_ID, data, transform);
}

export function comparingDataset<T>(
  data: AsyncData<RemoteData<T>>,
  transform?: (items: T[]) => any,
): DatasetOption {
  return remoteDataset(COMPARING_DATASET_ID, data, transform);
}

export function standardDataset<T>(transform?: (items: T[]) => any) {
  return template(({ datasetId, data }) => [remoteDataset(datasetId, data as any, transform)]);
}

export function remoteDataset<T>(
  id: string,
  data: AsyncData<RemoteData<T>>,
  transform?: (items: T[]) => any,
): DatasetOption {
  const sourceData = data?.data?.data ?? [];
  return {
    id,
    source: transform ? transform(sourceData as T[]) : sourceData,
  };
}

export function dataset(
  id: string = ORIGINAL_DATASET_ID,
  source: any,
  dimensions?: any[],
): DatasetOption {
  return { id, source, dimensions };
}
