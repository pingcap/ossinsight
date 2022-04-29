import React from 'react';
import {AnalyzeChartContextProps, AnalyzeContextProps, useAnalyzeChartContext, useAnalyzeContext} from './context';
import {EChartsOption} from 'echarts';
import ECharts, {EChartsProps} from '../components/ECharts';

export function withChart<T = unknown, P = {}>(useOption: (props: AnalyzeContextProps & AnalyzeChartContextProps<T>, chartProps?: P) => EChartsOption, defaultProps: Partial<Omit<EChartsProps, 'option'>> = {}) {
  return (props: Omit<EChartsProps, 'option'> & { spec?: P }) => {
    const context = useAnalyzeContext();
    const chartContext = useAnalyzeChartContext<T>();

    const option = useOption({...context, ...chartContext}, props.spec);

    return (
      <ECharts
        option={option}
        {...defaultProps}
        {...props}
      />
    );
  };
}