import { AnalyzeChartContextProps, AnalyzeContextProps } from '../context';
import { isNullish } from '@site/src/utils/value';

export interface DangerousCtx<T> extends AnalyzeContextProps, AnalyzeChartContextProps<T> {
  width: number;
  height: number;
  isSmall: boolean;
  context: Record<string, any>;
}

let dangerousCtx: DangerousCtx<unknown> | undefined;

export function dangerousSetCtx<T> (ctx: DangerousCtx<T> | undefined) {
  dangerousCtx = ctx as any;
}

export function dangerousGetCtx<T> (): DangerousCtx<T> {
  if (isNullish(dangerousCtx)) {
    throw new Error('out of analyze chart context!');
  }
  return dangerousCtx as DangerousCtx<T>;
}
