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

export type LocationData = {
  country_or_area: string;
  count: number;
};

const dataPointToLocationData = (
  data: DataPoint[],
  activity: string
): LocationData[] => {
  return data.map((item) => ({
    country_or_area: item.country_code,
    count: (item as any)[activity],
  }));
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
  const { getOrg } = ctx;

  const main = getOrg(Number(ctx.parameters.owner_id)).login;
  const vs = getOrg(Number(ctx.parameters.owner_id)).login;

  const { activity = 'stars' } = ctx.parameters;
  

  const max = input
    .flat()
    .reduce((prev, current) => Math.max(prev, (current as any)[activity] || 0), 1);

  const option = {
    dataset: compare(input, (data, name) =>
      datasets(name, 1, dataPointToLocationData(data, activity))
    ).flat(),
    geo: worldMapGeo(),
    series: compare([main, vs], (data, name) => [
      ...scatters(name, 1, max, {
        name: data,
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
// export const width = 648;
// export const height = 365;
