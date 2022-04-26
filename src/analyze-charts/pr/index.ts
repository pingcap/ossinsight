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

// lines of code
export type PrData = {
  all_size: number
  event_month: string
  l: number
  m: number
  s: number
  xl: number
  xs: number
  xxl: number
}

export const PrChart = withChart<PrData>(({title: propsTitle, data}) => ({
  dataset: originalDataset(data, transformLocData),
  xAxis: timeAxis<'x'>(undefined),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: {show: true},
  yAxis: [
    valueAxis<'y'>('size', {position: 'left'}),
    valueAxis<'y'>('total', {position: 'right'})
  ],
  series: [
    ...['xs', 's', 'm', 'l', 'xl', 'xxl'].map(size => bar('event_month', size, {stack: 'stack', yAxisId: 'size', emphasis: {focus: 'series'}})),
    line('event_month', 'total', {showSymbol: false, yAxisId: 'total', emphasis: {focus: 'self'}}),
  ],
  tooltip: axisTooltip('line'),
}), {
  aspectRatio: 16 / 9,
});

function transformLocData(data: PrData[]) {
  let total = 0;
  return data.map(item => ({
    ...item,
    total: (total = total + item.all_size),
  })) ?? [];
}
