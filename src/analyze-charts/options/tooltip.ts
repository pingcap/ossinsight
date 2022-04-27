import {TooltipOption} from 'echarts/types/dist/shared';
import {EChartsOption} from 'echarts';

export function axisTooltip(type: 'line' | 'shadow' | 'cross' | 'none'): EChartsOption['tooltip'] {
  return {
    show: true,
    trigger: 'axis',
    axisPointer: {
      type,
    },
  };
}

export function itemTooltip(): EChartsOption['tooltip'] {
  return {
    show: true,
    trigger: 'item',
  }
}