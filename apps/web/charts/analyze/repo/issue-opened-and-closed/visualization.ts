import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import { compare } from '@/lib/charts-utils/visualizer/analyze';
import {
  dataZoom,
  parseParams2DataZoomOpt,
  timeAxis,
  utils,
  axisTooltip,
  line,
  lineArea,
  legend,
  valueAxis,
  parseParams2GridOpt,
} from '@/lib/charts-utils/options';
import type { DataZoomOptType } from '@/lib/charts-utils/options';
import { prettyMs } from '@/lib/charts-utils/utils';
import { upBound } from '@/lib/charts-utils/options/utils';

type Params = {
  repo_id: string;
  vs_repo_id?: string;
} & DataZoomOptType;

type DataPoint = {
  event_month: string;
  closed: number;
  opened: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

const fmtHours = (hours: number) =>
  prettyMs.default(hours * 60 * 60 * 1000, { unitCount: 1 });

const getMaxAllValue = (all: (DataPoint[] | undefined)[]) => {
  if (all.length <= 1) {
    return undefined;
  }
  const max = all
    .flatMap((data) => data ?? [])
    .reduce((v, pr) => Math.max(pr.closed, pr.opened, v), 0);
  return upBound(max);
};

const getmMaxTotalValue = (all: (DataPoint[] | undefined)[]) => {
  if (all.length <= 1) {
    return undefined;
  }
  const max = all.flatMap((data) =>
    (data ?? []).reduce((v, pr) => [v[0] + pr.opened, v[1] + pr.closed], [0, 0])
  );
  return upBound(Math.max(...max));
};

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id ?? ''));

  const runtime = ctx.runtime;

  const maxAllValue = getMaxAllValue(input);
  const maxTotalValue = getmMaxTotalValue(input);

  const option = {
    dataset: compare(input, (data, name) => ({
      id: name,
      source: aggregate(data),
    })),
    grid: parseParams2GridOpt(ctx),
    dataZoom: dataZoom(parseParams2DataZoomOpt(ctx.parameters), !!vs, runtime),
    legend: legend(),
    xAxis: utils.template(({ id }) => timeAxis<'x'>(id, { gridId: id }), !!vs),
    yAxis: utils.template(
      ({ id }) => [
        valueAxis<'y'>(`${id}-diff`, {
          gridId: id,
          name: 'New / Issues',
          max: maxAllValue,
        }),
        valueAxis<'y'>(`${id}-total`, {
          gridId: id,
          name: 'Total / Issues',
          max: maxTotalValue,
        }),
      ],
      !!vs
    ),
    tooltip: axisTooltip('cross'),
    series: compare([main, vs], (data, name) => [
      lineArea('event_month', 'opened', `${name}-diff`, {
        datasetId: name,
        xAxisId: name,
        name: 'New Opened',
        tooltip: { valueFormatter: fmt },
      }),
      lineArea('event_month', 'closed', `${name}-diff`, {
        datasetId: name,
        xAxisId: name,
        name: 'New Closed',
        tooltip: { valueFormatter: fmt },
      }),
      line('event_month', 'opened_total', {
        showSymbol: false,
        datasetId: name,
        xAxisId: name,
        yAxisId: `${name}-total`,
        emphasis: { focus: 'self' },
        name: 'Total Opened',
        tooltip: { valueFormatter: fmt },
      }),
      line('event_month', 'closed_total', {
        showSymbol: false,
        datasetId: name,
        xAxisId: name,
        yAxisId: `${name}-total`,
        emphasis: { focus: 'self' },
        name: 'Total Closed',
        tooltip: { valueFormatter: fmt },
      }),
    ]).flat(),
  };

  return option;
}

const fmt = (val: any) => `${val} Issues`;

function aggregate(data: DataPoint[]) {
  let openedTotal = 0;
  let closedTotal = 0;
  return data.map((item) => ({
    ...item,
    opened_total: (openedTotal = openedTotal + item.opened),
    closed_total: (closedTotal = closedTotal + item.closed),
  }));
}

export const type = 'echarts';
