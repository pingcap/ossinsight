import {
  BarSeriesOption,
  BoxplotSeriesOption,
  HeatmapSeriesOption,
  LineSeriesOption,
  TreemapSeriesOption,
} from 'echarts';
import {ORIGINAL_DATASET_ID} from './dataset';
import {DimensionLoose, OptionEncodeValue} from 'echarts/types/src/util/types';

interface CartesianSeriesEncodeOption {
  x: OptionEncodeValue;
  y: OptionEncodeValue;
}

export function bar(x: OptionEncodeValue, y: OptionEncodeValue, option: BarSeriesOption = {}): BarSeriesOption {
  return {
    name: String(y),
    ...option,
    type: 'bar',
    datasetId: ORIGINAL_DATASET_ID,
    encode: {
      x,
      y,
      ...(option.encode || {}),
    },
  };
}

export function line(x: OptionEncodeValue, y: OptionEncodeValue, option: LineSeriesOption = {}): LineSeriesOption {
  return {
    name: String(y),
    datasetId: ORIGINAL_DATASET_ID,
    ...option,
    type: 'line',
    encode: {
      x,
      y,
      ...(option.encode || {}),
    },
  };
}

export function boxplot(x: OptionEncodeValue, y: [DimensionLoose, DimensionLoose, DimensionLoose, DimensionLoose, DimensionLoose], option: BoxplotSeriesOption = {}): BoxplotSeriesOption {
  return {
    type: 'boxplot',
    datasetId: ORIGINAL_DATASET_ID,
    ...option,
    encode: {
      x,
      y,
      tooltip: y,
      ...(option.encode || {}),
    },
  };
}

export function treemap(data: TreemapSeriesOption['data']): TreemapSeriesOption {
  return {
    type: 'treemap',
    data,
    breadcrumb: {
      show: false
    },
    label: {
      show: true,
      padding: 1,
    },
    roam: false,
    nodeClick: 'link',
    width: '80%',
    height: '80%'
  }
}

export function heatmap(x: OptionEncodeValue, y: OptionEncodeValue, value: OptionEncodeValue, option: HeatmapSeriesOption = {}): HeatmapSeriesOption {
  return {
    datasetId: ORIGINAL_DATASET_ID,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    ...option,
    type: 'heatmap',
    encode: {
      x,
      y,
      value,
      ...(option.encode || {}),
    },
  }
}