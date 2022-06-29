import {
  axisTooltip,
  dataZoom,
  legend,
  line,
  standardDataset,
  timeAxis,
  title,
  topBottomLayoutGrid,
  utils,
  valueAxis,
} from '../options';
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
  dataset: standardDataset(aggregate),
  grid: topBottomLayoutGrid(),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: legend(),
  xAxis: utils.template(({id}) => timeAxis<'x'>(id, {gridId: id})),
  yAxis: utils.template(({id}) => [
    valueAxis<'y'>(`${id}-diff`, {gridId: id, name: 'New / Issues'}),
    valueAxis<'y'>(`${id}-total`, {gridId: id, name: 'Total / Issues'}),
  ]),
  series: utils.template(({id, datasetId}) => [
    lineArea('event_month', 'opened', `${id}-diff`, {
      datasetId,
      xAxisId: id,
      name: 'New Opened',
      tooltip: {valueFormatter: fmt},
    }),
    lineArea('event_month', 'closed', `${id}-diff`, {
      datasetId,
      xAxisId: id,
      name: 'New Closed',
      tooltip: {valueFormatter: fmt},
    }),
    line('event_month', 'opened_total', {
      showSymbol: false,
      datasetId,
      xAxisId: id,
      yAxisId: `${id}-total`,
      emphasis: {focus: 'self'},
      name: 'Total Opened',
      tooltip: {valueFormatter: fmt},
    }),
    line('event_month', 'closed_total', {
      showSymbol: false,
      datasetId,
      xAxisId: id,
      yAxisId: `${id}-total`,
      emphasis: {focus: 'self'},
      name: 'Total Closed',
      tooltip: {valueFormatter: fmt},
    }),
  ]),
  tooltip: axisTooltip('cross'),
}), {
  aspectRatio: 16 / 9,
});

const fmt = val => `${val} Issues`;

function aggregate(data: IssueData[]) {
  let openedTotal = 0;
  let closedTotal = 0;
  return data.map((item) => ({
    ...item,
    opened_total: (openedTotal = openedTotal + item.opened),
    closed_total: (closedTotal = closedTotal + item.closed),
  }));
}