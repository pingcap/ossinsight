import {
  axisTooltip,
  bar,
  dataset,
  dataZoom,
  formatMonth,
  legend,
  line,
  timeAxis,
  title,
  topBottomLayoutGrid,
  utils,
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

export const LocChart = withChart<LocData>(({title: propsTitle}) => {

  return {
    dataset: utils.template<LocData>(({id, datasetId, data, context}) => {
      const transformedData = transformLocData(data.data?.data ?? []);
      context[`adjust-${id}`] = utils.adjustAxis(transformedData, [['additions', 'deletions'], ['total']]);
      return dataset(datasetId, transformedData);
    }),
    grid: topBottomLayoutGrid(),
    dataZoom: dataZoom(),
    title: title(propsTitle),
    legend: legend({selectedMode: false}),
    xAxis: utils.template(({id}) => timeAxis<'x'>(id, {gridId: id})),
    yAxis: utils.template(({id, context}) => [
      valueAxis<'y'>(`${id}-diff`, {
        gridId: id,
        ...context[`adjust-${id}`][0],
        position: 'left',
        axisLabel: {showMaxLabel: false, showMinLabel: false},
        name: 'Diff / lines',
      }),
      valueAxis<'y'>(`${id}-total`, {
        gridId: id,
        ...context[`adjust-${id}`][1],
        position: 'right',
        axisLabel: {showMaxLabel: false, showMinLabel: false},
        name: 'Total / lines',
      }),
    ]),
    series: utils.template(({id, datasetId}) => [
      bar('event_month', 'additions', {
        datasetId: datasetId,
        stack: `stack-${id}`,
        color: '#57ab5a',
        xAxisId: id,
        yAxisId: `${id}-diff`,
      }),
      bar('event_month', 'deletions', {
        datasetId: datasetId,
        stack: `stack-${id}`,
        color: '#e5534b',
        xAxisId: id,
        yAxisId: `${id}-diff`,
      }),
      line('event_month', 'total', {
        datasetId: datasetId,
        showSymbol: false,
        color: '#cc6b2c',
        xAxisId: id,
        yAxisId: `${id}-total`,
      }),
    ]),
    tooltip: axisTooltip('cross', {
      formatter: params => {
        const [add, del, total] = params;
        return `
        <div>${formatMonth(add.value.event_month)}</div>
        <div>
          <b style="color: ${add.color}; font-weight: 800">+${add.value.additions}</b>
          <b style="color: ${del.color}; font-weight: 800">-${Math.abs(del.value.deletions)}</b>
        </div>
        <div>
          ${total.marker}
          <b>Total: ${total.value.total} lines</b>
        </div>
      `;
      },
    }),
  };
}, {
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
