export type BarData<T> = {
  unit: string
  x: keyof T
  y: keyof T
  postfix: keyof T
  label?: keyof T
  data: T[]
}

export type LineData<T> = {
  unit: string;
  y: number,
  label: number,
  x: string[],
  data: T[]
}

export type WeekdayDistributionData = {
  unit: string;
  data: [string, number, number, number, number, number, number, number][]
}

export type CountryData = {
  unit: string
  labels: string[]
  data: [string, string, ...number[]][]
  highlights: number[][]
}

declare module "./*.json" {
  type Data = BarData<any> | LineData<any> | WeekdayDistributionData

  export default Data;
}