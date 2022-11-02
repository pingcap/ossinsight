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
import { withChart } from '../chart';

// lines of code
export type LocData = {
  event_month: string;
  additions: number;
  deletions: number;
  changes: number;
};

export const LocChart = withChart<LocData>(({ title: propsTitle }) => {
  return {
    dataset: utils.template<LocData>(({ id, datasetId, data, context }) => {
      const transformedData = transformLocData(data.data?.data ?? []);
      const adjusted = utils.adjustAxis(transformedData, [['additions', 'deletions'], ['total']]);
      context.adjust = context.adjust ?? [];
      for (let i = 0; i < 2; i++) {
        context.adjust[i] = {
          max: Math.max(adjusted[i].max, context.adjust[i]?.max ?? Number.MIN_VALUE),
          min: Math.min(adjusted[i].min, context.adjust[i]?.min ?? Number.MAX_VALUE),
        };
      }
      return dataset(datasetId, transformedData);
    }),
    grid: topBottomLayoutGrid(),
    dataZoom: dataZoom(),
    title: title(propsTitle),
    legend: legend({ selectedMode: false }),
    xAxis: utils.template(({ id }) => timeAxis<'x'>(id, { gridId: id })),
    yAxis: utils.template(({ id, context }) => [
      valueAxis<'y'>(`${id}-diff`, {
        gridId: id,
        ...context.adjust[0],
        position: 'left',
        name: 'Diff / lines',
      }),
      valueAxis<'y'>(`${id}-total`, {
        gridId: id,
        ...context.adjust[1],
        position: 'right',
        name: 'Total / lines',
      }),
    ]),
    series: utils.template(({ id, datasetId }) => [
      bar('event_month', 'additions', {
        datasetId,
        stack: `stack-${id}`,
        color: '#57ab5a',
        xAxisId: id,
        yAxisId: `${id}-diff`,
        barMaxWidth: 8,
      }),
      bar('event_month', 'deletions', {
        datasetId,
        stack: `stack-${id}`,
        color: '#e5534b',
        xAxisId: id,
        yAxisId: `${id}-diff`,
        barMaxWidth: 8,
      }),
      line('event_month', 'total', {
        datasetId,
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
          <b style="color: ${add.color as string}; font-weight: 800">+${add.value.additions as number}</b>
          <b style="color: ${del.color as string}; font-weight: 800">-${Math.abs(del.value.deletions)}</b>
        </div>
        <div>
          ${total.marker as string}
          <b>Total: ${total.value.total as string} lines</b>
        </div>
      `;
      },
    }),
  };
}, {
  aspectRatio: 16 / 9,
});

function transformLocData (data: LocData[]) {
  let total = 0;
  return data.map(item => ({
    event_month: item.event_month,
    additions: item.additions,
    deletions: -item.deletions,
    total: (total = total + item.additions - item.deletions),
  })) ?? [];
}
