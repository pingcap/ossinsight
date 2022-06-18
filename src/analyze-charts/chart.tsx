import CodeIcon from '@mui/icons-material/Code';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import EChartsReact from 'echarts-for-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CommonChartContext, { CommonChartShareInfo } from '../components/CommonChart/context';
import DebugDialog from '../components/DebugDialog/DebugDialog';
import ShareDialog from '../components/ShareDialog';
import {AnalyzeChartContextProps, AnalyzeContextProps, useAnalyzeChartContext, useAnalyzeContext} from './context';
import {EChartsOption} from 'echarts';
import ECharts, { EChartsContext, EChartsProps } from '../components/ECharts';
import { DangerousCtx, dangerousSetCtx } from './options/_danger';
import useDimensions from 'react-cool-dimensions';
import { debounce } from '@mui/material';

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

    const [showDebugModel, setShowDebugModel] = useState(false);
    const [showShareModel, setShowShareModel] = useState(false);
    const echartsRef = useRef<EChartsReact>()

    const handleShowDebugModel = useCallback(() => {
      setShowDebugModel(true);
    }, [])

    const handleCloseDebugModel = useCallback(() => {
      setShowDebugModel(false);
    }, [])

    const handleShowShareModel = useCallback(() => {
      setShowShareModel(true);
    }, [])

    const handleCloseShareModel = useCallback(() => {
      setShowShareModel(false);
    }, [])

    const shareBtnDisabled = useMemo(() => {
      return !!(chartContext.data.loading || chartContext.data.error || chartContext.compareData.loading || chartContext.compareData.error)
    }, [chartContext.data.loading, chartContext.compareData.loading, chartContext.data.error, chartContext.compareData.error])

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

    option.toolbox = {
      padding: isSmall ? 0 : 8,
      feature: {
        myShareChart: {
          show: !shareBtnDisabled,
          icon: 'path://M736,608a127.776,127.776,0,0,0-115.232,73.28l-204.896-117.056a30.848,30.848,0,0,0-9.696-3.2A127.68,127.68,0,0,0,416,512c0-6.656-0.992-13.088-1.984-19.456,0.608-0.32,1.28-0.416,1.856-0.768l219.616-125.472A127.328,127.328,0,0,0,736,416c70.592,0,128-57.408,128-128s-57.408-128-128-128-128,57.408-128,128c0,6.72,0.992,13.152,1.984,19.616-0.608,0.288-1.28,0.256-1.856,0.608l-219.616,125.472A127.328,127.328,0,0,0,288,384c-70.592,0-128,57.408-128,128s57.408,128,128,128a126.912,126.912,0,0,0,84.544-32.64,31.232,31.232,0,0,0,11.584,12.416l224,128c0.352,0.224,0.736,0.256,1.12,0.448C615.488,812.992,669.6,864,736,864c70.592,0,128-57.408,128-128s-57.408-128-128-128',
          onclick: handleShowShareModel
        }
      }
    }

    return (
      <div style={{ position: 'relative' }}>
        <Box display='flex' justifyContent='flex-end'>
          <Button size='small' onClick={handleShowDebugModel} endIcon={<CodeIcon />}>SHOW SQL</Button>
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
            <DebugDialog query={chartContext.query} sql={chartContext.data.data?.sql} params={chartContext.data.data?.params} open={showDebugModel} onClose={handleCloseDebugModel} />
            <ShareDialog open={showShareModel} onClose={handleCloseShareModel} />
          </EChartsContext.Provider>
        </CommonChartContext.Provider>
      </div>
    );
  };
}