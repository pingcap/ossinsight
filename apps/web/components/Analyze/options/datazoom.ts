import type { EChartsOption } from 'echarts';

export function dataZoom(): EChartsOption['dataZoom'] {
  return [
    {
      type: 'inside',
      filterMode: 'weakFilter',
    },
  ];
}
