import {axisTooltip, dataZoom, legend, line, originalDataset, timeAxis, title, valueAxis} from '../options';
import {withChart} from '../chart';
import {OptionEncodeValue} from 'echarts/types/src/util/types';
import {LineSeriesOption} from 'echarts';
import deepmerge from 'deepmerge';

// lines of code
export type IssueData = {
  event_month: string
  opened: number
  closed: number
}


function lineArea(x: OptionEncodeValue, y: OptionEncodeValue, yAxis: string, option: LineSeriesOption = {}) {
  return line(x, y, deepmerge(option, {
    showSymbol: false,
    emphasis: {focus: 'series'},
    areaStyle: {},
    yAxisId: yAxis,
  }));
}

export const IssueChart = withChart<IssueData>(({title: propsTitle, data}) => ({
  dataset: originalDataset(data, aggregate),
  xAxis: timeAxis<'x'>(undefined),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: legend(),
  yAxis: [
    valueAxis<'y'>('diff', {name: 'New / Issues'}),
    valueAxis<'y'>('total', {name: 'Total / Issues'}),
  ],
  series: [
    lineArea('event_month', 'opened', 'diff', {name: 'New Opened', tooltip: {valueFormatter: fmt}}),
    lineArea('event_month', 'closed', 'diff', {name: 'New Closed', tooltip: {valueFormatter: fmt}}),
    line('event_month', 'opened_total', {showSymbol: false, yAxisId: 'total', emphasis: {focus: 'self'}, name: 'Total Opened', tooltip: {valueFormatter: fmt}}),
    line('event_month', 'closed_total', {showSymbol: false, yAxisId: 'total', emphasis: {focus: 'self'}, name: 'Total Closed', tooltip: {valueFormatter: fmt}}),
  ],
  tooltip: axisTooltip('cross'),
}), {
  aspectRatio: 16 / 9,
});

const fmt = val => `${val} Issues`

function aggregate(data: IssueData[]) {
  let openedTotal = 0;
  let closedTotal = 0;
  return data.map((item) => ({
    ...item,
    opened_total: (openedTotal = openedTotal + item.opened),
    closed_total: (closedTotal = closedTotal + item.closed),
  }));
}