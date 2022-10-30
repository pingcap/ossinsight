import { useThemeMediaQuery } from "@site/src/hooks/theme";
import { useMemo } from "react";

export function useChartFontSizeBase() {
  const large = useThemeMediaQuery(theme => theme.breakpoints.up('md'));
  const small = useThemeMediaQuery(theme => theme.breakpoints.down('sm'));

  if (large) {
    return 20;
  } else if (small) {
    return 12;
  } else {
    return 16;
  }
}

export type FontSizes = {
  title: () => number
  axisTick: () => number
  dataLabel: () => number
  tooltipTitle: () => number
  tooltipBody: () => number
  subtitle: () => number
  legend: () => number
}

export function useChartFontSizes(): FontSizes {
  const base = useChartFontSizeBase();

  return useMemo(() => {
    return {
      title: () => base,
      axisTick: () => 0.75 * base,
      dataLabel: () => base,
      tooltipTitle: () => base,
      tooltipBody: () => 1.25 * base,
      subtitle: () => base * 0.7,
      legend: () => 0.8 * base,
    };
  }, [base]);
}
