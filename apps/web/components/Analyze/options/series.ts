import type {
  BarSeriesOption,
  BoxplotSeriesOption,
  HeatmapSeriesOption,
  LineSeriesOption,
  ScatterSeriesOption,
  EffectScatterSeriesOption,
} from 'echarts';
import { ORIGINAL_DATASET_ID } from './dataset';

export function bar(x: any, y: any, option: BarSeriesOption = {}): BarSeriesOption {
  return {
    name: String(y),
    datasetId: ORIGINAL_DATASET_ID,
    ...option,
    type: 'bar',
    encode: { x, y, ...option.encode },
  };
}

export function line(x: any, y: any, option: LineSeriesOption = {}): LineSeriesOption {
  return {
    name: String(y),
    datasetId: ORIGINAL_DATASET_ID,
    showSymbol: false,
    ...option,
    type: 'line',
    encode: { x, y, ...option.encode },
  };
}

export function boxplot(
  x: any,
  y: [any, any, any, any, any],
  option: BoxplotSeriesOption = {},
): BoxplotSeriesOption {
  return {
    datasetId: ORIGINAL_DATASET_ID,
    ...option,
    type: 'boxplot',
    encode: { x, y, tooltip: y, ...option.encode },
  };
}

export function heatmap(
  x: any,
  y: any,
  value: any,
  option: HeatmapSeriesOption = {},
): HeatmapSeriesOption {
  return {
    datasetId: ORIGINAL_DATASET_ID,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
    ...option,
    type: 'heatmap',
    encode: { x, y, value, ...option.encode },
  };
}

export function scatters(
  idPrefix: string,
  topN: number,
  max: number,
  option: ScatterSeriesOption & EffectScatterSeriesOption = {},
): Array<ScatterSeriesOption | EffectScatterSeriesOption> {
  const commonOptions = {
    coordinateSystem: 'geo' as const,
    encode: {
      lng: 1,
      lat: 2,
      value: 3,
      tooltip: [0, 3],
      itemId: 0,
    },
    symbolSize: (val: any) => 1 + Math.sqrt(val[3] / max) * 64,
    ...option,
  };
  return [
    { type: 'effectScatter', datasetId: `${idPrefix}_top_${topN}`, ...commonOptions },
    { type: 'scatter', datasetId: `${idPrefix}_rest`, ...commonOptions },
  ];
}
