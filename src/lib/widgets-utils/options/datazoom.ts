import type { EChartsOption } from 'echarts';
import { template } from './utils';

export function dataZoom(
  option: EChartsOption['dataZoom'] = undefined,
  vs?: boolean,
  runtime?: string
): EChartsOption['dataZoom'] {
  const isServer = runtime === 'server';
  if (isServer) {
    return { show: false };
  }

  return {
    show: true,
    left: 8,
    right: 8,
    realtime: true,
    xAxisId: template(({ id }) => id, vs),
    ...option,
  };
}

export function parseParams2DataZoomOpt(parameters: Record<string, any>) {
  const start_date = parameters?.start_date;
  const end_date = parameters?.end_date;

  return {
    startValue: start_date ? new Date(start_date) : undefined,
    endValue: end_date ? new Date(end_date) : undefined,
  };
}

export type DataZoomOptType = ReturnType<typeof parseParams2DataZoomOpt>;
