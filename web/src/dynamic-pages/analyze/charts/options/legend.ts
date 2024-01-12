import type { EChartsOption } from 'echarts';
import { isSmall } from './sizes';

export function legend (option: EChartsOption['legend'] = {}): EChartsOption['legend'] {
  if (isSmall()) {
    return {
      left: 'center',
      padding: [0, 32],
      top: 0,
      type: 'scroll',
      ...option,
      orient: 'horizontal',
    };
  } else {
    return {
      left: 8,
      top: 8,
      ...option,
      show: true,
    };
  }
}
