import { KeyOfType, KeyOfTypeOptionalIncluded } from '@site/src/dynamic-pages/analyze/charts/options/utils/data';

export type BarData<T> = {
  unit: string;
  x: KeyOfType<T, number>;
  y: KeyOfType<T, string>;
  postfix: KeyOfTypeOptionalIncluded<T, string>;
  label?: KeyOfTypeOptionalIncluded<T, string>;
  data: T[];
};

export type LineData<T> = {
  unit: string;
  y: number;
  label: number;
  x: string[];
  data: T[];
};

export type WeekdayDistributionData = {
  unit: string;
  data: Array<[string, number, number, number, number, number, number, number]>;
};

export type CountryData = {
  unit: string;
  labels: string[];
  data: Array<[string, string, ...number[]]>;
  highlights: number[][];
};

declare module './*.json' {
  type Data = BarData<any> | LineData<any> | WeekdayDistributionData;

  export default Data;
}
