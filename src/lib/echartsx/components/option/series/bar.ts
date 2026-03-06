import { BarSeriesOption } from 'echarts/charts';
import { withBaseOption } from '../base';

export const BarSeries = withBaseOption<BarSeriesOption>(
  'series',
  { type: 'bar' },
  'BarSeries',
);
