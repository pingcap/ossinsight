import {DatasetOption} from 'echarts/types/dist/shared';
import {AsyncData, RemoteData} from '../../components/RemoteCharts/hook';
import {DimensionDefinitionLoose, OptionSourceData} from 'echarts/types/src/util/types';

export const ORIGINAL_DATASET_ID = 'original';

export function originalDataset<T>(data: AsyncData<RemoteData<unknown, T>>, transform?: (item: T[]) => any): DatasetOption {
  return remoteDataset(ORIGINAL_DATASET_ID, data, transform);
}

export function remoteDataset<T>(id: string, data: AsyncData<RemoteData<unknown, T>>, transform?: (item: T[]) => any): DatasetOption {
  const sourceData = data?.data?.data ?? [];
  return {
    id,
    source: transform ? transform(sourceData) : sourceData,
  };
}

export function dataset(id: string = ORIGINAL_DATASET_ID, source: OptionSourceData, dimensions: DimensionDefinitionLoose[] | undefined = undefined): DatasetOption {
  return {
    id,
    source,
    dimensions,
  };
}
