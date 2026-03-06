import type { VisualMapComponentOption } from 'echarts';
// import { isSmall } from './sizes';

export function visualMap(
  min: number,
  max: number,
  runtime?: string
): VisualMapComponentOption {
  return {
    show: !(runtime === 'server'),
    min: 0,
    max,
    orient: 'horizontal',
    left: 'center',
    bottom: 8,
  };
}
