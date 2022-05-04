import {
  axisTooltip,
  bar,
  dataZoom,
  legend,
  line,
  originalDataset,
  standardDataset,
  timeAxis,
  title, topBottomLayoutGrid,
  utils,
  valueAxis,
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
  dataset: standardDataset(transformLocData),
  grid: topBottomLayoutGrid(),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: legend(),
  xAxis: utils.template(({id}) => timeAxis<'x'>(id, {gridId: id}) ),
  yAxis: utils.template(({id}) => [
    valueAxis<'y'>(`${id}-size`, {gridId: id, position: 'left', name: 'New / PRs'}),
    valueAxis<'y'>(`${id}-total`, {gridId: id, position: 'right', name: 'Total / PRs'}),
  ]),
  series: utils.template(({id, datasetId}) =>  [
    ...['xs', 's', 'm', 'l', 'xl', 'xxl'].map(size => bar('event_month', size, {
      datasetId,
      stack: `${id}-stack`,
      xAxisId: id,
      yAxisId: `${id}-size`,
      emphasis: {focus: 'series'},
      tooltip: {
        valueFormatter: fmt,
      },
    })),
    line('event_month', 'total', {
      showSymbol: false,
      datasetId,
      xAxisId: id,
      yAxisId: `${id}-total`,
      emphasis: {focus: 'self'},
      tooltip: {valueFormatter: fmt},
    }),
  ]),
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
