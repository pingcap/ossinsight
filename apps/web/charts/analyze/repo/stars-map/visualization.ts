import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import {
  buildMapChartOption,
  type LocationData,
} from '@/charts/shared/map-chart';

type Params = {
  repo_id: string;
  vs_repo_id?: string;
};

type DataPoint = {
  count: number;
  country_or_area: string;
  percentage: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export type { LocationData };

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id ?? ''));

  const max = input
    .flat()
    .reduce((prev, current) => Math.max(prev, current?.count || 0), 1);

  return buildMapChartOption({
    data: input,
    names: [main, vs],
    max,
    toLocationData: (data) =>
      data.map((item) => ({
        country_or_area: item.country_or_area,
        count: item.count,
      })),
  });
}

export const type = 'echarts';
