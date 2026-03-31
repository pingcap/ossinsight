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
    height: 16,
    borderColor: 'transparent',
    backgroundColor: '#1a1a1b',
    fillerColor: 'rgba(255,255,255,0.05)',
    handleSize: 16,
    handleStyle: { color: '#555', borderColor: '#555', borderWidth: 1 },
    moveHandleSize: 4,
    textStyle: { color: '#888', fontSize: 10 },
    dataBackground: { lineStyle: { color: 'transparent' }, areaStyle: { color: 'transparent' } },
    selectedDataBackground: { lineStyle: { color: 'transparent' }, areaStyle: { color: 'transparent' } },
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
