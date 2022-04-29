import {AnalyzeChartContextProps, AnalyzeContextProps} from '../context';

type Ctx<T> = AnalyzeContextProps & AnalyzeChartContextProps<T> & {context: Record<string, any>}

let dangerousCtx: Ctx<unknown> | undefined = undefined;

export function dangerousSetCtx<T>(ctx: Ctx<T> | undefined) {
  dangerousCtx = ctx;
}

export function dangerousGetCtx<T>(): Ctx<T> | undefined {
  if (!dangerousCtx) {
    throw new Error('out of analyze chart context!');
  }
  return dangerousCtx as Ctx<T>;
}
