import {axisTooltip, bar, dataZoom, legend, line, originalDataset, timeAxis, title, valueAxis} from '../options';
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
  legend: legend(),
  yAxis: [
    valueAxis<'y'>('size', {position: 'left', name: 'New / PRs'}),
    valueAxis<'y'>('total', {position: 'right', name: 'Total / PRs'}),
  ],
  series: [
    ...['xs', 's', 'm', 'l', 'xl', 'xxl'].map(size => bar('event_month', size, {
      stack: 'stack',
      yAxisId: 'size',
      emphasis: {focus: 'series'},
      tooltip: {
        valueFormatter: fmt,
      },
    })),
    line('event_month', 'total', {
      showSymbol: false,
      yAxisId: 'total',
      emphasis: {focus: 'self'},
      tooltip: {valueFormatter: fmt},
    }),
  ],
  tooltip: axisTooltip('cross'),
}), {
  aspectRatio: 16 / 9,
});

const fmt = val => `${val} PRs`;

function transformLocData(data: PrData[]) {
  let total = 0;
  return data.map(item => ({
    ...item,
    total: (total = total + item.all_size),
  })) ?? [];
}
