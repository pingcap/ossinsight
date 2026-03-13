import type { EChartsOption } from 'echarts';

export function legend(option: any = {}): EChartsOption['legend'] {
  return {
    show: true,
    top: 32,
    left: 'center',
    ...option,
  };
}
