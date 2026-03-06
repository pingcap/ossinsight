export * as prettyMs from 'pretty-ms';

export function upBound(num: number): number {
  if (num === 0) {
    return 0;
  }

  const sign = Math.sign(num);
  const mag = Math.abs(num);

  let base = 1;
  while (mag > base) {
    base *= 10;
  }
  base /= 20;

  return (Math.floor(mag / base) + 1) * base * sign;
}

/**
 *
 * @param sw Source width
 * @param sh Source height
 * @param tw Target container width
 * @param th Target container height
 */
export function scaleToFit(
  sw: number,
  sh: number,
  tw: number,
  th: number
): { width: number; height: number } {
  let width = tw;
  let height = (tw * sh) / sw;
  if (height > th) {
    width *= th / height;
    height = th;
  }

  return { width, height };
}

export function isEmptyData(datasource: any): boolean {
  if (datasource == null) {
    return true;
  }
  if (typeof datasource !== 'object') {
    return false;
  }
  if (datasource instanceof Array) {
    if (datasource.length === 0) {
      return true;
    }
    // if any sub data is not empty, the datasource is not empty.
    return datasource.findIndex((sub) => !isEmptyData(sub)) === -1;
  }
  return false;
}

export function upperFirst(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function mergeURLSearchParams(
  searchParamsStr: string,
  ...args: Record<string, any>[]
): URLSearchParams {
  const params = new URLSearchParams(searchParamsStr);
  for (const arg of args) {
    for (const [key, value] of Object.entries(arg)) {
      if (value != null) {
        params.set(key, value);
      }
    }
  }
  return params;
}

export function getWidgetSize(
  colNum: number = 12,
  colsWidth: number = 960,
  gapWidth: number = 16
) {
  const stepWidth = colsWidth / colNum;
  const fullWidth = colsWidth + gapWidth * (colNum - 1);
  const widgetWidth = (col: number, gapOffsetNum: number = 0) => {
    return col * stepWidth + gapWidth * (col - 1 + gapOffsetNum);
  };
  return {
    stepWidth,
    widgetWidth,
    fullWidth,
  };
}

// example: 0.1234 => 12.34%
export function number2percent(
  num: number,
  option?: {
    max?: number;
    maxLabel?: string;
    min?: number;
    minLabel?: string;
  }
): string {
  const defaultMax = 999;
  const defaultMin = -999;

  const max = option?.max ?? defaultMax;
  const min = option?.min ?? defaultMin;

  if (num > max) {
    return option?.maxLabel || `Over 999%`;
  }
  if (num < min) {
    return option?.minLabel || `Under -999%`;
  }
  if (num > 1 || num < -1) {
    return `${(num * 100).toFixed(0)}%`;
  }
  return `${(num * 100).toFixed(2)}%`;
}
