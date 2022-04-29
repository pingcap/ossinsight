import React from 'react';
import {withChart} from '../chart';
import {
  axisTooltip,
  COMPARING_DATASET_ID,
  comparingDataset,
  line,
  originalDataset,
  timeAxis,
  title,
  valueAxis,
} from '../options';

type LineData<T extends string> = Record<T, number> & {
  event_month: string
}

export const LineChart = withChart<LineData<any>, { valueIndex: string, name: string }>(({
  title: propsTitle,
  data,
  compareData,
  repoName,
  comparingRepoName,
}, {valueIndex, name}) => ({
  xAxis: timeAxis<'x'>(),
  yAxis: valueAxis<'y'>(undefined, {name}),
  title: title(propsTitle),
  tooltip: axisTooltip('line'),
  dataset: [
    originalDataset(data),
    comparingDataset(compareData),
  ],
  series: [
    line('event_month', valueIndex, {name: repoName}),
    line('event_month', valueIndex, {datasetId: COMPARING_DATASET_ID, name: comparingRepoName}),
  ],
}));