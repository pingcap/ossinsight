import type { EChartsVisualizationConfig } from '@/lib/charts-types';
import { compare } from '@/lib/charts-utils/visualizer/analyze';
import {
  worldMapGeo,
  scatters,
  itemTooltip,
} from '@/lib/charts-utils/options';
import { alpha2ToGeo, alpha2ToTitle } from '@/lib/charts-utils/geo';

export type LocationData = {
  country_or_area: string;
  count: number;
};

export function transformData(
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

export function datasets(
  idPrefix: string,
  topN: number,
  data: LocationData[]
): any[] {
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

export interface MapChartInput<D> {
  data: [D[], D[] | undefined];
  names: [any, any];
  max: number;
  toLocationData: (data: D[]) => LocationData[];
}

export function buildMapChartOption<D>(
  input: MapChartInput<D>
): EChartsVisualizationConfig {
  const { data, names, max, toLocationData } = input;

  return {
    dataset: compare(data, (d, name) =>
      datasets(name, 1, toLocationData(d))
    ).flat(),
    geo: worldMapGeo(),
    series: compare(names, (data, name) => [
      ...scatters(name, 1, max, {
        name: data?.fullName ?? data,
      }),
    ]).flat(),
    tooltip: itemTooltip(),
    legend: {
      show: true,
      top: '6%',
    },
  };
}
