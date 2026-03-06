import { createContext, MutableRefObject } from 'react';
import type EChartsReact from 'echarts-for-react';

export interface EChartsContextProps {
  echartsRef?: MutableRefObject<EChartsReact | null>;
  title?: string;
  description?: string;
  keyword?: string[];
}

export default createContext<EChartsContextProps>({
  echartsRef: undefined,
  title: undefined,
  description: undefined,
  keyword: undefined,
});
