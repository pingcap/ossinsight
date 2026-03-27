import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import { compare } from '@/lib/charts-utils/visualizer/analyze';
import {
  parseParams2GridOpt,
  utils,
  timeAxis,
  valueAxis,
  axisTooltip,
  bar as barSeries,
  dataZoom,
  parseParams2DataZoomOpt,
} from '@/lib/charts-utils/options';
import type { DataZoomOptType } from '@/lib/charts-utils/options';

type Params = {
  repo_id: string;
  vs_repo_id?: string;
} & DataZoomOptType;

type DataPoint = {
  commits: number;
  pushes: number;
  event_month: string;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id ?? ''));

  const dataset = compare(input, (data, name) => ({
    id: name,
    source: data,
  }));

  return {
    dataset,
    grid: parseParams2GridOpt(ctx),
    xAxis: utils.template(
      ({ id }) => timeAxis<'x'>(id, { gridId: id }, undefined, input),
      !!vs
    ),
    yAxis: utils.template(({ id }) =>
      valueAxis<'y'>(id, { name: 'Count', gridId: id }),
      !!vs
    ),
    series: compare([main, vs], (data, name) => [
      barSeries('event_month', 'pushes', {
        xAxisId: name,
        yAxisId: name,
        emphasis: { focus: 'series' },
        datasetId: name,
        barMaxWidth: 4,
      }),
      barSeries('event_month', 'commits', {
        xAxisId: name,
        yAxisId: name,
        emphasis: { focus: 'series' },
        datasetId: name,
        barMaxWidth: 4,
      }),
    ]).flatMap((x) => [x[0], x[1]] as const),
    dataZoom: dataZoom(parseParams2DataZoomOpt(ctx.parameters), !!vs, ctx.runtime),
    tooltip: axisTooltip('cross'),
    legend: {
      show: true,
    },
  };
}

export const type = 'echarts';
