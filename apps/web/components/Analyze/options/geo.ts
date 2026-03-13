import type { EChartsOption } from 'echarts';

export function worldMapGeo(): EChartsOption['geo'] {
  return {
    map: 'world',
    roam: true,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    emphasis: {
      label: { show: false },
      itemStyle: { areaColor: '#2a333d' },
    },
    itemStyle: {
      areaColor: '#1e2731',
      borderColor: '#3b4a59',
    },
  } as any;
}
