import {AxisPointerOption, TooltipOption} from 'echarts/types/dist/shared';
import {EChartsOption} from 'echarts';

export function axisTooltip(type: 'line' | 'shadow' | 'cross' | 'none', option: Exclude<EChartsOption['tooltip'], any[]> = {}): EChartsOption['tooltip'] {
  return {
    ...option,
    show: true,
    trigger: 'axis',
    axisPointer: {
      ...(option.axisPointer||{}),
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