import {OptionId} from 'echarts/types/src/util/types';
import {XAXisOption, YAXisOption} from 'echarts/types/dist/shared';

type AxisOption<T extends 'x' | 'y'> = T extends 'x' ? XAXisOption : YAXisOption

export function valueAxis<T extends 'x' | 'y'>(id?: OptionId, option: AxisOption<T> = {}): AxisOption<T> {
  return {
    ...option,
    id,
    type: 'value',
  } as AxisOption<T>;
}

export function logAxis<T extends 'x' | 'y'>(id?: OptionId, option: AxisOption<T> = {}): AxisOption<T> {
  return {
    ...option,
    id,
    type: 'log',
  }
}

export function timeAxis<T extends 'x' | 'y'>(id?: OptionId, option: AxisOption<T> = {}): AxisOption<T> {
  return {
    ...option,
    id,
    type: 'time',
  } as AxisOption<T>;
}