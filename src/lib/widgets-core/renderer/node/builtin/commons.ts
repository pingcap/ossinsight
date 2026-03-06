import { BuiltinWidgetProps, BuiltinWidgetsMap } from '../../builtin-widgets';

export type Box = {
  dpr: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export type BuiltinProps<K extends keyof BuiltinWidgetsMap> = {
  colorScheme: string
  box: Box;
} & BuiltinWidgetProps<K>;

export function transformBox({ width, height, top, left, dpr }: Box) {
  return {
    width: width * dpr,
    height: height * dpr,
    top: top * dpr,
    left: left * dpr,
    dpr,
  }
}

export {};
