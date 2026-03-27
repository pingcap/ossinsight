import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import { compare } from '@/lib/charts-utils/visualizer/analyze';
import {
  worldMapGeo,
  scatters,
  itemTooltip,
} from '@/lib/charts-utils/options';
import { alpha2ToGeo, alpha2ToTitle } from '@/lib/charts-utils/geo';

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

export type LocationData = {
  country_or_area: string;
  count: number;
};

function transformData(
  data: LocationData[]
): Array<[string, number, number, number]> {
  return data
    .map((item) => {
      const title = alpha2ToTitle(item.country_or_area);
      const { long, lat } = alpha2ToGeo(item.country_or_area) ?? {};
      return [title, long, lat, item.count] as [string, number, number, number];
    })
    .sort((a, b) => Math.sign(b[3] - a[3]));
}

function datasets(idPrefix: string, topN: number, data: LocationData[]): any[] {
  const transformedData = transformData(data);
  return [
    {
      id: `${idPrefix}_top_${topN}`,
      source: transformedData.slice(0, topN),
    },
    {
      id: `${idPrefix}_rest`,
      source: transformedData.slice(topN),
    },
  ];
}

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id ?? ''));

  const max = input
    .flat()
    .reduce((prev, current) => Math.max(prev, current?.count || 0), 1);

  const option = {
    dataset: compare(input, (data, name) => datasets(name, 1, data)).flat(),
    geo: worldMapGeo(),
    series: compare([main, vs], (data, name) => [
      ...scatters(name, 1, max, {
        name: data?.fullName,
      }),
    ]).flat(),
    tooltip: itemTooltip(),
    legend: {
      show: true,
      top: '6%',
    },
  };

  return option;
}

export const type = 'echarts';
