import type { EChartsOption } from 'echarts';

export function title(text?: string): EChartsOption['title'] {
  if (!text) return undefined;
  return {
    text,
    left: 'center',
    top: 0,
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#c8c8c8',
    },
  };
}
