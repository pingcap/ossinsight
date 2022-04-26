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
export type LocData = {
  event_month: string
  additions: number
  deletions: number
  changes: number
}

export const LocChart = withChart<LocData>(({title: propsTitle, data}) => ({
  dataset: originalDataset(data, transformLocData),
  xAxis: timeAxis<'x'>(undefined),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: {show: true},
  yAxis: valueAxis<'y'>(),
  series: [
    bar('event_month', 'additions', {stack: 'stack', color: '#57ab5a'}),
    bar('event_month', 'deletions', {stack: 'stack', color: '#e5534b'}),
    line('event_month', 'total', {showSymbol: false, color: '#cc6b2c'}),
  ],
  tooltip: axisTooltip('line'),
}), {
  aspectRatio: 16 / 9,
});

function transformLocData(data: LocData[]) {
  let total = 0;
  return data.map(item => ({
    event_month: item.event_month,
    additions: item.additions,
    deletions: -item.deletions,
    total: (total = total + item.additions - item.deletions),
  })) ?? [];
}
