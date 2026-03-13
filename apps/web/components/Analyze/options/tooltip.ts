import type { EChartsOption } from 'echarts';

export function axisTooltip(
  type: 'line' | 'shadow' | 'cross' | 'none',
  option: any = {},
): EChartsOption['tooltip'] {
  return {
    ...option,
    show: true,
    trigger: 'axis',
    axisPointer: { ...option.axisPointer, type },
  };
}

export function itemTooltip(option: any = {}): EChartsOption['tooltip'] {
  return {
    renderMode: 'html',
    ...option,
    show: true,
    trigger: 'item',
  };
}
