import {AnalyzeChartContextProps, AnalyzeContextProps} from '../context';

export interface DangerousCtx<T> extends AnalyzeContextProps, AnalyzeChartContextProps<T>{
  width: number
  height: number
  isSmall: boolean
  context: Record<string, any>
}

let dangerousCtx: DangerousCtx<unknown> | undefined = undefined;

export function dangerousSetCtx<T>(ctx: DangerousCtx<T> | undefined) {
  dangerousCtx = ctx as any;
}

export function dangerousGetCtx<T>(): DangerousCtx<T> | undefined {
  if (!dangerousCtx) {
    throw new Error('out of analyze chart context!');
  }
  return dangerousCtx as DangerousCtx<T>;
}
