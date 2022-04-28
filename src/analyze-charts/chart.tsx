import React from 'react';
import {AnalyzeChartContextProps, useAnalyzeChartContext} from './context';
import {EChartsOption} from 'echarts';
import ECharts, {EChartsProps} from '../components/ECharts';

export function withChart<T = unknown, P = {}>(useOption: (props: AnalyzeChartContextProps<T>, chartProps?: P) => EChartsOption, defaultProps: Partial<Omit<EChartsProps, 'option'>> = {}) {
  return (props: Omit<EChartsProps, 'option'> & { spec?: P }) => {
    const context = useAnalyzeChartContext<T>();

    const option = useOption(context, props.spec);

    return (
      <ECharts
        option={option}
        {...defaultProps}
        {...props}
      />
    );
  };
}