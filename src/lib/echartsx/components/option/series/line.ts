import { LineSeriesOption } from 'echarts/charts';
import { withBaseOption } from '../base';

export const LineSeries = withBaseOption<LineSeriesOption>(
  'series',
  { type: 'line' },
  'LineSeries',
);
