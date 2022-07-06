import React from 'react';
import {withChart} from '../chart';
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
  event_month: string
}

export const LineChart = withChart<LineData<any>, { valueIndex: string, name: string, fromRecent?: boolean }>(({
  title: propsTitle,
  data,
  compareData,
  repoName,
  comparingRepoName,
}, {valueIndex, name, fromRecent = false}) => ({
  xAxis: timeAxis<'x'>(undefined, undefined, fromRecent),
  yAxis: valueAxis<'y'>(undefined, {name}),
  title: title(propsTitle),
  tooltip: axisTooltip('line'),
  legend: legend({
    top: 32,
    right: 0,
    left: undefined
  }),
  grid: {
    bottom: 8
  },
  dataset: [
    originalDataset(data),
    comparingDataset(compareData),
  ],
  series: [
    line('event_month', valueIndex, {name: repoName}),
    line('event_month', valueIndex, {datasetId: COMPARING_DATASET_ID, name: comparingRepoName}),
  ],
}));