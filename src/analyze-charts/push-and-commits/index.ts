import {EChartsOption} from 'echarts';
import {
  axisTooltip,
  bar,
  line,
  originalDataset,
  timeAxis,
  valueAxis,
  title, dataZoom,
} from '../options';
import {withChart} from '../chart';
import {OptionEncodeValue, OptionId} from 'echarts/types/src/util/types';

// lines of code
export type PushesAndCommitsData = {
  event_month: string
  pushes: number
  commits: number
}


export const PushesAndCommitsChart = withChart<PushesAndCommitsData>(({title: propsTitle, data}) => ({
  dataset: originalDataset(data),
  xAxis: timeAxis<'x'>(undefined),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: {show: true},
  yAxis: [
    valueAxis<'y'>('diff'),
    valueAxis<'y'>('total')
  ],
  series: [
    bar('event_month', 'pushes', {yAxisId: 'total', emphasis: {focus: 'series'}}),
    bar('event_month', 'commits', {yAxisId: 'total', emphasis: {focus: 'series'}}),
  ],
  tooltip: axisTooltip('line'),
}), {
  aspectRatio: 16 / 9,
});
