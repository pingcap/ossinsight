import {EChartsOption} from 'echarts';

export function title(text: string | undefined, options: EChartsOption['title'] = {}): EChartsOption['title'] {
  return text ? {
    ...options,
    text,
    left: 'center',
    top: 8,
    textStyle: {
      fontSize: 14,
      color: 'gray',
    },
  } : undefined;
}