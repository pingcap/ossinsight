import type { EChartsOption } from 'echarts';

export function createTimeSeriesOption (series: any[]): EChartsOption {
  return {
    xAxis: { type: 'time', min: '2011-01-01' },
    yAxis: { type: 'value' },
    series,
  };
}
