import {BarSeriesOption, BoxplotSeriesOption, LineSeriesOption} from 'echarts';
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