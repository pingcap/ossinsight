import {
  axisTooltip,
  bar,
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
import { withChart } from '../chart';
import { upBound } from '../utils';

// lines of code
export type PrData = {
  all_size: number;
  event_month: string;
  l: number;
  m: number;
  s: number;
  xl: number;
  xs: number;
};

export const PrChart = withChart<PrData>(
  ({ title: propsTitle, isSmall, data }) => {
    const maxAllSizeValue = utils.aggregate<PrData>(all => {
      if (all.length <= 1) {
        return undefined;
      }
      const max = all
        .flatMap(data => data.data?.data ?? [])
        .reduce((v, pr) => Math.max(pr.all_size, v), 0);
      return upBound(max);
    });

    const maxTotalValue = utils.aggregate<PrData>(all => {
      if (all.length <= 1) {
        return undefined;
      }
      const max = all
        .map(data => (data.data?.data ?? []).reduce((v, pr) => v + pr.all_size, 0));
      return upBound(Math.max(...max));
    });

    return {
      dataset: standardDataset(transformLocData),
      grid: topBottomLayoutGrid(),
      dataZoom: dataZoom(),
      title: title(propsTitle),
      legend: legend({ top: isSmall ? 0 : 32, left: 'center' }),
      xAxis: utils.template(({ id }) => timeAxis<'x'>(id, { gridId: id })),
      yAxis: utils.template(({ id }) => [
        valueAxis<'y'>(`${id}-size`, { gridId: id, position: 'left', name: 'New / PRs', max: maxAllSizeValue }),
        valueAxis<'y'>(`${id}-total`, { gridId: id, position: 'right', name: 'Total / PRs', max: maxTotalValue }),
      ]),
      series: utils.template(({ id, datasetId }) => [
        ...['xs', 's', 'm', 'l', 'xl'].map(size => bar('event_month', size, {
          datasetId,
          stack: `${id}-stack`,
          xAxisId: id,
          yAxisId: `${id}-size`,
          emphasis: { focus: 'series' },
          tooltip: {
            valueFormatter: fmt,
          },
          barMaxWidth: 8,
        })),
        line('event_month', 'total', {
          showSymbol: false,
          datasetId,
          xAxisId: id,
          yAxisId: `${id}-total`,
          emphasis: { focus: 'self' },
          tooltip: { valueFormatter: fmt },
        }),
      ]),
      tooltip: axisTooltip('cross'),
    };
  },
  {
    aspectRatio: 16 / 9,
  },
);

const fmt = (val: number) => `${val} PRs`;

function transformLocData (data: PrData[]) {
  let total = 0;
  return data.map(item => ({
    ...item,
    total: (total = total + item.all_size),
  })) ?? [];
}
