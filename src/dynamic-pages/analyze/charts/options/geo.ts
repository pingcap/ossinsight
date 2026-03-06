import type { EChartsOption } from 'echarts';

export function worldMapGeo (): EChartsOption['geo'] {
  return {
    roam: false,
    map: 'world',
    silent: true,
    zoom: 1.7,
    top: '35%',
    projection: {
      project: (point) => [point[0] / 180 * Math.PI, -Math.log(Math.tan((Math.PI / 2 + point[1] / 180 * Math.PI) / 2))],
      unproject: (point) => [point[0] * 180 / Math.PI, 2 * 180 / Math.PI * Math.atan(Math.exp(point[1])) - 90],
    },
    itemStyle: {
      color: '#ccc',
      borderWidth: 1,
      borderColor: '#ccc',
    },
  };
}
