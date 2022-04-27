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
export type IssueData = {
  event_month: string
  opened: number
  closed: number
}


function lineArea(x: OptionEncodeValue, y: OptionEncodeValue, yAxis: string) {
  return line(x, y, {
    showSymbol: false,
    emphasis: {focus: 'series'},
    areaStyle: {},
    yAxisId: yAxis
  });
}

export const IssueChart = withChart<IssueData>(({title: propsTitle, data}) => ({
  dataset: originalDataset(data, aggregate),
  xAxis: timeAxis<'x'>(undefined),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: {show: true},
  yAxis: [
    valueAxis<'y'>('diff'),
    valueAxis<'y'>('total')
  ],
  series: [
    lineArea('event_month', 'opened', 'diff'),
    lineArea('event_month', 'closed', 'diff'),
    line('event_month', 'opened_total', {showSymbol: false, yAxisId: 'total', emphasis: {focus: 'self'}}),
    line('event_month', 'closed_total', {showSymbol: false, yAxisId: 'total', emphasis: {focus: 'self'}}),
  ],
  tooltip: axisTooltip('line'),
}), {
  aspectRatio: 16 / 9,
});

function aggregate(data: IssueData[]) {
  let openedTotal = 0;
  let closedTotal = 0;
  return data.map((item) => ({
    ...item,
    opened_total: (openedTotal = openedTotal + item.opened),
    closed_total: (closedTotal = closedTotal + item.closed),
  }));
}