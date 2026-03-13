export function upperFirst(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
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
