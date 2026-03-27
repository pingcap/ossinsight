import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import { compare } from '@/lib/charts-utils/visualizer/analyze';
import {
  legend,
  parseParams2GridOpt,
  dataZoom,
  parseParams2DataZoomOpt,
  timeAxis,
  utils,
  valueAxis,
  axisTooltip,
  bar,
  line,
} from '@/lib/charts-utils/options';
import type { DataZoomOptType } from '@/lib/charts-utils/options';
import { upBound } from '@/lib/charts-utils/options/utils';

type Params = {
  repo_id: string;
  vs_repo_id?: string;
} & DataZoomOptType;

type DataPoint = {
  all_size: number;
  event_month: string;
  l: number;
  m: number;
  s: number;
  xl: number;
  xs: number;
  xxl: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

function transformLocData(data: DataPoint[]) {
  let total = 0;
  return (
    data.map((item) => ({
      ...item,
      total: (total = total + item.all_size),
    })) ?? []
  );
}

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id ?? ''));

  const getMaxAllSizeValue = (all: DataPoint[]) => {
    if (all.length <= 1) {
      return undefined;
    }
    const max = all.reduce((v, pr) => (pr ? Math.max(pr?.all_size, v) : v), 0);
    return upBound(max);
  };
  const getMaxTotalValue = (all: DataPoint[]) => {
    if (all.length <= 1) {
      return undefined;
    }
    const max = all.reduce((v, pr) => (pr ? v + pr.all_size : v), 0);
    return upBound(max);
  };

  const flattedInput = input.flat().filter((d): d is DataPoint => d != null);
  const maxAllSizeValue = getMaxAllSizeValue(flattedInput);
  const maxTotalValue = getMaxTotalValue(flattedInput);

  const option = {
    dataset: compare(input, (data, name) => ({
      id: name,
      source: transformLocData(data),
    })),
    grid: parseParams2GridOpt(ctx),
    dataZoom: dataZoom(parseParams2DataZoomOpt(ctx.parameters), !!vs, ctx.runtime),
    legend: legend({ top: 32, left: 'center' }),
    xAxis: utils.template(({ id }) => timeAxis<'x'>(id, { gridId: id }), !!vs),
    yAxis: utils.template(
      ({ id }) => [
        valueAxis<'y'>(`${id}-size`, {
          gridId: id,
          position: 'left',
          name: 'New / PRs',
          max: maxAllSizeValue,
        }),
        valueAxis<'y'>(`${id}-total`, {
          gridId: id,
          position: 'right',
          name: 'Total / PRs',
          max: maxTotalValue,
        }),
      ],
      !!vs
    ),
    tooltip: axisTooltip('cross'),
    series: compare([main, vs], (data, name) => [
      ...['xs', 's', 'm', 'l', 'xl'].map((size) =>
        bar('event_month', size, {
          datasetId: name,
          stack: `${name}-stack`,
          xAxisId: name,
          yAxisId: `${name}-size`,
          emphasis: { focus: 'series' },
          tooltip: {
            valueFormatter: fmt,
          },
          barMaxWidth: 8,
        })
      ),
      line('event_month', 'total', {
        showSymbol: false,
        datasetId: name,
        xAxisId: name,
        yAxisId: `${name}-total`,
        emphasis: { focus: 'self' },
        tooltip: { valueFormatter: fmt },
      }),
    ]).flat(),
  };

  return option;
}

const units = ['', 'k', 'm', 'b'];

function format(value: number) {
  if (value === 0) {
    return '0';
  }
  let i = 0;
  while (value % 1000 === 0 && i < units.length) {
    value = value / 1000;
    i++;
  }

  return `${value}${units[i]}`;
}

const fmt = (val: any) => `${val} PRs`;

export const type = 'echarts';
