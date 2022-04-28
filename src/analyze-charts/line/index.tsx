import React from 'react';
import {withChart} from '../chart';
import {axisTooltip, legend, line, originalDataset, timeAxis, valueAxis} from '../options';

type LineData<T extends string> = Record<T, number> & {
  event_month: string
}

export const LineChart = withChart<LineData<any>, { valueIndex: string }>(({data, compareData}, {valueIndex}) => ({
  xAxis: timeAxis<'x'>(),
  yAxis: valueAxis<'y'>(),
  tooltip: axisTooltip('line'),
  dataset: [
    originalDataset(data),
  ],
  series: [
    line('event_month', valueIndex),
  ],
}));