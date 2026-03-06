import { createContext } from 'react';
import { EChartsOption } from 'echarts/types/dist/shared';
import { ComponentOption as EChartsComponentOption } from 'echarts/types/src/util/types';

const OptionContext = createContext<{
  setOption(option: EChartsOption): void
  set(id: string, component: EChartsComponentOption): void
  remove(id: string): void
  markNoMerge(): void
}>({
  setOption() {
  },
  set() {
  },
  markNoMerge() {
  },
  remove() {
  },
});

OptionContext.displayName = 'EChartsxContext';
export default OptionContext;
