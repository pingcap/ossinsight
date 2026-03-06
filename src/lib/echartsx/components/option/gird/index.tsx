import { withBaseOption } from '../base';
import { GridComponentOption } from 'echarts/components';

export const Grid = withBaseOption<GridComponentOption>(
  'grid',
  undefined,
  'Grid',
);
