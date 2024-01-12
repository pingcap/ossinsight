import { withChart } from '../chart';
import {
  axisTooltip,
  COMPARING_DATASET_ID,
  comparingDataset, legend,
  line,
  originalDataset,
  timeAxis,
  title,
  valueAxis,
} from '../options';

type LineData<T extends string> = Record<T, number> & {
  event_month: string;
};

export const LineChart = withChart<LineData<any>, { valueIndex: string, name: string, fromRecent?: boolean }>(({
  title: propsTitle,
  data,
  compareData,
  repoName,
  comparingRepoName,
  isSmall,
}, { valueIndex, name, fromRecent = false }) => ({
  xAxis: timeAxis<'x'>(undefined, undefined, !fromRecent ? 'event_month' : fromRecent),
  yAxis: valueAxis<'y'>(undefined, { name }),
  title: title(propsTitle),
  tooltip: axisTooltip('line'),
  legend: legend({
    top: isSmall ? 8 : 32,
    right: 0,
    left: undefined,
  }),
  grid: {
    left: 8,
    bottom: 8,
    top: isSmall ? 8 : 64,
    right: 8,
  },
  dataset: [
    originalDataset(data),
    comparingDataset(compareData),
  ],
  series: [
    line('event_month', valueIndex, { name: repoName, showSymbol: (data.data?.data.length ?? NaN) <= 1 }),
    line('event_month', valueIndex, { datasetId: COMPARING_DATASET_ID, name: comparingRepoName, showSymbol: (compareData.data?.data.length ?? NaN) <= 1 }),
  ],
}));
