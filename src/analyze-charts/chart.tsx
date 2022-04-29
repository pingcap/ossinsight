import React from 'react';
import {AnalyzeChartContextProps, AnalyzeContextProps, useAnalyzeChartContext, useAnalyzeContext} from './context';
import {EChartsOption} from 'echarts';
import ECharts, {EChartsProps} from '../components/ECharts';
import {dangerousSetCtx} from './options/_danger';

export function withChart<T = unknown, P = {}>(useOption: (props: AnalyzeContextProps & AnalyzeChartContextProps<T>, chartProps?: P) => EChartsOption, defaultProps: Partial<Omit<EChartsProps, 'option'>> = {}) {
  return (props: Omit<EChartsProps, 'option'> & { spec?: P }) => {
    const context = useAnalyzeContext();
    const chartContext = useAnalyzeChartContext<T>();

    const ctx = {...context, ...chartContext, context: {} as Record<string, any>};

    dangerousSetCtx(ctx);
    const option = useOption(ctx, props.spec);
    if (ctx.context.DEBUG_PRINT_OPTION) {
      console.debug(option)
    }
    dangerousSetCtx(undefined);

    return (
      <ECharts
        option={option}
        {...defaultProps}
        {...props}
        notMerge
        lazyUpdate
      />
    );
  };
}