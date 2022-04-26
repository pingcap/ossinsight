import {EChartsOption} from 'echarts';
import {ZRTextAlign} from 'echarts/types/src/util/types';

export function title(text: string | undefined, options: EChartsOption['title'] = {}): EChartsOption['title'] {
  return text ? {
    ...options,
    text,
    top: 16,
    left: 'center'
  } : undefined
}