import type { EChartsOption } from 'echarts';
import format from 'human-format';
import merge from 'deepmerge';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatMonth = (value: number | string | Date) => {
  const date = new Date(value);
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

export function valueAxis<T extends 'x' | 'y'>(id?: any, option: any = {}): any {
  return merge(option, {
    id,
    type: 'value',
    axisLabel: {
      formatter: (value: number) => format(value),
      margin: 8,
    },
    axisPointer: {
      label: { precision: 0 },
    },
    nameTextStyle: {
      align: option.position ?? 'left',
    },
  });
}

export function categoryAxis<T extends 'x' | 'y'>(id?: any, option: any = {}): any {
  return merge(option, {
    id,
    type: 'category',
    nameTextStyle: {
      align: option.position ?? 'left',
    },
  });
}

export function logAxis<T extends 'x' | 'y'>(id?: any, option: any = {}): any {
  return merge(option, {
    id,
    type: 'log',
    nameTextStyle: {
      align: option.position ?? 'left',
    },
    axisLabel: { margin: 8 },
  });
}

export function timeAxis<T extends 'x' | 'y'>(id?: any, option: any = {}): any {
  const now = new Date();
  return merge(option, {
    id,
    type: 'time',
    axisPointer: {
      label: {
        formatter: ({ value }: { value: any }) => formatMonth(value),
      },
    },
    max: new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0),
    minInterval: 3600 * 24 * 1000 * 28,
  });
}
