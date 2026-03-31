import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import {
  buildMapChartOption,
  type LocationData,
} from '@/charts/shared/map-chart';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type StarDataPoint = {
  country_code: string;
  stars: number;
};

type ParticipantDataPoint = {
  country_code: string;
  participants: number;
};

type DataPoint = StarDataPoint | ParticipantDataPoint;

type Input = [DataPoint[], DataPoint[] | undefined];

export type { LocationData };

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const { getOrg } = ctx;

  const main = getOrg(Number(ctx.parameters.owner_id))?.login ?? 'unknown';
  const vs = getOrg(Number(ctx.parameters.owner_id))?.login ?? 'unknown';

  const { activity = 'stars' } = ctx.parameters;

  const max = input
    .flat()
    .reduce(
      (prev, current) => Math.max(prev, (current as any)[activity] || 0),
      1
    );

  return buildMapChartOption({
    data: input,
    names: [main, vs],
    max,
    toLocationData: (data) =>
      data.map((item) => ({
        country_or_area: item.country_code,
        count: (item as any)[activity],
      })),
  });
}

export const type = 'echarts';
