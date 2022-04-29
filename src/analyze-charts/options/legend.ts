import {EChartsOption} from 'echarts';

export function legend(option: EChartsOption['legend'] = {}): EChartsOption['legend'] {
  return {
    left: 8,
    top: 8,
    ...option,
    show: true,
  };
}
