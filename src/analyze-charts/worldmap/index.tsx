import * as echarts from 'echarts';
import {itemTooltip, legend, scatters, title, utils, worldMapGeo} from '../options';
import {withChart} from '../chart';
import map from '@geo-maps/countries-land-10km';
import {alpha2ToGeo, alpha2ToTitle} from '../../lib/areacode';
import {DatasetOption} from 'echarts/types/dist/shared';

if (!echarts.getMap('world')) {
  echarts.registerMap('world', map());
}

// lines of code
export type LocationData = {
  country_or_area: string
  count: number
}

function transformData(data: LocationData[]): [string, number, number, number][] {
  return data.map(item => {
    const title = alpha2ToTitle(item.country_or_area);
    const {long, lat} = alpha2ToGeo(item.country_or_area);
    return [
      title,
      long,
      lat,
      item.count,
    ] as [string, number, number, number];
  }).sort((a, b) => Math.sign(b[3] - a[3]));
}

function datasets(idPrefix: string, topN: number, data: LocationData[]): DatasetOption[] {
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

export const WorldMapChart = withChart<LocationData>(({title: propsTitle}) => {
    const max = utils.aggregate<LocationData>(all => all.map(data => (data.data?.data ?? []).reduce((prev, current) => Math.max(prev, current.count), 1)).reduce((p, c) => Math.max(p, c), 0));
    return {
      dataset: utils.template<LocationData>(({datasetId, data}) => datasets(datasetId, 1, data.data?.data ?? [])),
      legend: legend(),
      title: title(propsTitle),
      geo: worldMapGeo(),
      series: utils.template(({datasetId, id, name}) => [
        ...scatters(datasetId, 1, max, {
          name,
        }),
      ]),
      tooltip: itemTooltip(),
    };
  },
  {
    aspectRatio: 16 / 9,
  },
);

