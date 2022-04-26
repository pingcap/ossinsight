import React from 'react';
import {AnalyzeChartContextProps, useAnalyzeChartContext} from './context';
import {EChartsOption} from 'echarts';
import {LocData} from './loc';
import ECharts, {EChartsProps} from '../components/ECharts';

export function withChart<T = unknown>(useOption: (props: AnalyzeChartContextProps<T>) => EChartsOption, defaultProps: Partial<Omit<EChartsProps, 'option'>> = {}) {
  return (props: Omit<EChartsProps, 'option'>) => {
    const context = useAnalyzeChartContext<T>();

    const option = useOption(context);

    return (
      <ECharts
        option={option}
        {...defaultProps}
        {...props}
      />
    );
  };
}