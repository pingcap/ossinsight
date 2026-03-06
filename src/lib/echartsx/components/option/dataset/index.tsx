import { DatasetComponentOption } from 'echarts/components';
import { withBaseOption } from '../base';

export const Dataset = withBaseOption<DatasetComponentOption>(
  'dataset',
  {},
  'Dataset',
);
