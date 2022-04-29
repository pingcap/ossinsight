import {OptionId} from 'echarts/types/src/util/types';
import {XAXisOption, YAXisOption} from 'echarts/types/dist/shared';
import merge from 'deepmerge';
import {
  AxisBaseOption,
  CategoryAxisBaseOption,
  LogAxisBaseOption,
  TimeAxisBaseOption,
  ValueAxisBaseOption,
} from 'echarts/types/src/coord/axisCommonTypes';
import format from 'human-format';

type AxisOption<T extends 'x' | 'y', Base extends AxisBaseOption = AxisBaseOption> =
  (T extends 'x' ? XAXisOption : YAXisOption)
  & Base

export function valueAxis<T extends 'x' | 'y'>(id?: OptionId, option: AxisOption<T, ValueAxisBaseOption> = {}): AxisOption<T> {
  return merge<AxisOption<T>>(option, {
    id,
    type: 'value',
    axisLabel: {
      formatter: value => format(value),
    },
    axisPointer: {
      label: {
        precision: 0
      },
    },
  });
}

export function categoryAxis<T extends 'x' | 'y'>(id?: OptionId, option: AxisOption<T, CategoryAxisBaseOption> = {}): AxisOption<T> {
  return merge<AxisOption<T>>(option, {
    id,
    type: 'category',
  });
}

export function logAxis<T extends 'x' | 'y'>(id?: OptionId, option: AxisOption<T, LogAxisBaseOption> = {}): AxisOption<T> {
  return merge<AxisOption<T>>(option, {
    id,
    type: 'log',
  });
}

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const formatMonth = (value: number | string | Date) => {
  const date = new Date(value)
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

const now = new Date()

export function timeAxis<T extends 'x' | 'y'>(id?: OptionId, option: AxisOption<T, TimeAxisBaseOption> = {}): AxisOption<T> {
  return merge<AxisOption<T>>(option, {
    id,
    type: 'time',
    axisPointer: {
      label: {
        formatter: ({value}) => {
          return formatMonth(value)
        }
      }
    },
    min: new Date(2011, 0, 1, 0, 0, 0, 0),
    max: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  });
}