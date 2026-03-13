import {
  DimensionDefinitionLoose,
  OptionSourceData,
} from 'echarts/types/src/util/types';
import { DatasetOption } from 'echarts/types/dist/shared';

export const ORIGINAL_DATASET_ID = 'original';

export function dataset(
  id: string = ORIGINAL_DATASET_ID,
  source: OptionSourceData,
  dimensions: DimensionDefinitionLoose[] | undefined = undefined
): DatasetOption {
  return {
    id,
    source,
    dimensions,
  };
}
