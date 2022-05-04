import {EChartsOption} from 'echarts';
import { template } from './utils';

export function dataZoom(option: EChartsOption['dataZoom'] = undefined): EChartsOption['dataZoom'] {
  return {
    show: true,
    realtime: true,
    xAxisId: template(({ id }) => id),
    ...option,
  };
}