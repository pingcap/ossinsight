import {
  BarSeriesOption,
  BoxplotSeriesOption,
  EffectScatterSeriesOption,
  HeatmapSeriesOption,
  LineSeriesOption,
  ScatterSeriesOption,
  TreemapSeriesOption,
} from 'echarts';
import { ORIGINAL_DATASET_ID } from './dataset';
import { DimensionLoose, OptionEncodeValue } from 'echarts/types/src/util/types';

export function bar (x: OptionEncodeValue, y: OptionEncodeValue, option: BarSeriesOption = {}): BarSeriesOption {
  return {
    name: String(y),
    datasetId: ORIGINAL_DATASET_ID,
    ...option,
    type: 'bar',
    encode: {
      x,
      y,
      ...option.encode,
    },
  };
}

export function line (x: OptionEncodeValue, y: OptionEncodeValue, option: LineSeriesOption = {}): LineSeriesOption {
  return {
    name: String(y),
    datasetId: ORIGINAL_DATASET_ID,
    showSymbol: false,
    ...option,
    type: 'line',
    encode: {
      x,
      y,
      ...option.encode,
    },
  };
}

export function boxplot (x: OptionEncodeValue, y: [DimensionLoose, DimensionLoose, DimensionLoose, DimensionLoose, DimensionLoose], option: BoxplotSeriesOption = {}): BoxplotSeriesOption {
  return {
    datasetId: ORIGINAL_DATASET_ID,
    ...option,
    type: 'boxplot',
    encode: {
      x,
      y,
      tooltip: y,
      ...option.encode,
    },
  };
}

export function treemap (data: TreemapSeriesOption['data']): TreemapSeriesOption {
  return {
    type: 'treemap',
    data,
    breadcrumb: {
      show: false,
    },
    label: {
      show: true,
      padding: 1,
    },
    roam: false,
    nodeClick: 'link',
    width: '80%',
    height: '80%',
  };
}

export function heatmap (x: OptionEncodeValue, y: OptionEncodeValue, value: OptionEncodeValue, option: HeatmapSeriesOption = {}): HeatmapSeriesOption {
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
    encode: {
      x,
      y,
      value,
      ...option.encode,
    },
  };
}

export function scatters (idPrefix: string, topN: number, max: number, option: ScatterSeriesOption & EffectScatterSeriesOption = {}): Array<ScatterSeriesOption | EffectScatterSeriesOption> {
  const commonOptions: ScatterSeriesOption & EffectScatterSeriesOption = {
    coordinateSystem: 'geo',
    encode: {
      lng: 1,
      lat: 2,
      value: 3,
      tooltip: [0, 3],
      itemId: 0,
    },
    symbolSize: (val) => {
      return 1 + Math.sqrt(val[3] / max) * 64;
    },
    ...option,
  };
  return [
    {
      type: 'effectScatter',
      datasetId: `${idPrefix}_top_${topN}`,
      ...commonOptions,
    },
    {
      type: 'scatter',
      datasetId: `${idPrefix}_rest`,
      ...commonOptions,
    },
  ];
}
