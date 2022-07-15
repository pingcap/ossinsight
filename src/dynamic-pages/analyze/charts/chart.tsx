import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import EChartsReact from 'echarts-for-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import CommonChartContext, { CommonChartShareInfo } from '../../../components/CommonChart/context';
import {useAnalyzeChartContext, useAnalyzeContext} from './context';
import {EChartsOption} from 'echarts';
import ECharts, { EChartsContext, EChartsProps } from '../../../components/ECharts';
import { DangerousCtx, dangerousSetCtx } from './options/_danger';
import useDimensions from 'react-cool-dimensions';
import { debounce } from '@mui/material';
import { useDebugDialog } from "../../../components/DebugDialog";

export function withChart<T = unknown, P = {}>(useOption: (props: DangerousCtx<T>, chartProps?: P) => EChartsOption, defaultProps: Partial<Omit<EChartsProps, 'option'>> = {}) {
  return (props: Omit<EChartsProps, 'option'> & { spec?: P }) => {
    const context = useAnalyzeContext();
    const chartContext = useAnalyzeChartContext<T>();

    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const [width, setWidth] = useState(640)
    const [height, setHeight] = useState(480)
    const { observe, unobserve } = useDimensions({
      onResize: useMemo(
        () =>
          debounce(({ width, height }) => {
            // Triggered once per every 500 milliseconds
            setWidth(width)
            setHeight(height)
          }, 500),
        [setWidth, setHeight]
      ),
    })

    useEffect(() => {
      return unobserve
    }, [])

    const { dialog: debugDialog, button: debugButton } = useDebugDialog(chartContext.data.data)
    const echartsRef = useRef<EChartsReact>()

    const shareInfo: CommonChartShareInfo = {
      title: chartContext.title,
      description: chartContext.description ?? '',
      keywords: ['OSSInsight'],
      hash: chartContext.hash,
      message: context.comparingRepoName
        ? `Comparing ${context.repoName} with ${context.comparingRepoName} | ${chartContext.title} | OSSInsight`
        : `Analyzing ${context.repoName} | ${chartContext.title} | OSSInsight`,
    }

    const ctx = {...context, ...chartContext, context: {} as Record<string, any>, width: width || 640, height: height || 480, isSmall};

    dangerousSetCtx(ctx);
    const option = useOption(ctx, props.spec);
    if (ctx.context.DEBUG_PRINT_OPTION) {
      console.debug(option)
    }
    dangerousSetCtx(undefined);

    return (
      <div style={{ position: 'relative' }}>
        <Box display='flex' justifyContent='flex-end'>
          {debugButton}
        </Box>
        <CommonChartContext.Provider value={{shareInfo}}>
          <EChartsContext.Provider value={{echartsRef}}>
            <ECharts
              option={option}
              observe={observe}
              {...defaultProps}
              {...props}
              notMerge
              lazyUpdate
              ref={echartsRef}
            />
            {debugDialog}
          </EChartsContext.Provider>
        </CommonChartContext.Provider>
      </div>
    );
  };
}