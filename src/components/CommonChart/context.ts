import { createContext } from 'react';

export interface CommonChartProps {
  shareInfo?: CommonChartShareInfo;
}

export interface CommonChartShareInfo {
  title?: string;
  description?: string;
  keywords?: string[];
  hash?: string;
  message?: string;
}

export default createContext<CommonChartProps>({
  shareInfo: undefined,
});
