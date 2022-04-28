import {
  axisTooltip,
  bar,
  dataZoom,
  formatMonth,
  legend,
  line,
  originalDataset,
  timeAxis,
  title,
  valueAxis,
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
  legend: legend(),
  yAxis: valueAxis<'y'>(),
  series: [
    bar('event_month', 'additions', {stack: 'stack', color: '#57ab5a'}),
    bar('event_month', 'deletions', {stack: 'stack', color: '#e5534b'}),
    line('event_month', 'total', {showSymbol: false, color: '#cc6b2c'}),
  ],
  tooltip: axisTooltip('cross', {
    formatter: params => {
      const [add, del, total] = params
      return `
        <div>${formatMonth(add.value.event_month)}</div>
        <div>
          <b style="color: ${add.color}; font-weight: 800">+${add.value.additions}</b>
          <b style="color: ${del.color}; font-weight: 800">-${Math.abs(del.value.deletions)}</b>
        </div>
        <div>
          ${total.marker}
          <b>Total: ${total.value.total}</b>
        </div>
      `
    }
  }),
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
