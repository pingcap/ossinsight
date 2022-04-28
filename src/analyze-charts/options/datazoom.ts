import {EChartsOption} from 'echarts';

export function dataZoom(option: EChartsOption['dataZoom'] = undefined): EChartsOption['dataZoom'] {
  return {
    show: true,
    realtime: true,
    ...option,
  };
}