export type BarData<T> = {
  unit: string
  x: keyof T
  y: keyof T
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


declare module "./*.json" {
  type Data = BarData<any> | LineData<any>

  export default Data;
}