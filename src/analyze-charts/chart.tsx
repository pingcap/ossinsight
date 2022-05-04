import ShareIcon from '@mui/icons-material/Share';
import Fab from '@mui/material/Fab';
import EChartsReact from 'echarts-for-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import CommonChartContext, { CommonChartShareInfo } from '../components/CommonChart/context';
import ShareDialog from '../components/ShareDialog';
import {AnalyzeChartContextProps, AnalyzeContextProps, useAnalyzeChartContext, useAnalyzeContext} from './context';
import {EChartsOption} from 'echarts';
import ECharts, { EChartsContext, EChartsProps } from '../components/ECharts';
import {dangerousSetCtx} from './options/_danger';

export function withChart<T = unknown, P = {}>(useOption: (props: AnalyzeContextProps & AnalyzeChartContextProps<T>, chartProps?: P) => EChartsOption, defaultProps: Partial<Omit<EChartsProps, 'option'>> = {}) {
  return (props: Omit<EChartsProps, 'option'> & { spec?: P }) => {
    const context = useAnalyzeContext();
    const chartContext = useAnalyzeChartContext<T>();

    const [showDebugModel, setShowDebugModel] = useState(false);
    const echartsRef = useRef<EChartsReact>()

    const handleShowDebugModel = useCallback(() => {
      setShowDebugModel(true);
    }, [])

    const handleCloseDebugModel = useCallback(() => {
      setShowDebugModel(false);
    }, [])

    const shareBtnDisabled = useMemo(() => {
      return !!(chartContext.data.loading || chartContext.data.error || chartContext.compareData.loading || chartContext.compareData.error)
    }, [chartContext.data.loading, chartContext.compareData.loading, chartContext.data.error, chartContext.compareData.error])

    const shareInfo: CommonChartShareInfo = {
      title: chartContext.title,
      description: chartContext.description,
      keywords: [],
      hash: chartContext.hash,
      message: context.comparingRepoName
        ? `I'm comparing ${context.repoName} vs ${context.comparingRepoName} at OSSInsight.io`
        : `I'm analyzing ${context.repoName} at OSSInsight.io`,
    }

    const ctx = {...context, ...chartContext, context: {} as Record<string, any>};

    dangerousSetCtx(ctx);
    const option = useOption(ctx, props.spec);
    if (ctx.context.DEBUG_PRINT_OPTION) {
      console.debug(option)
    }
    dangerousSetCtx(undefined);

    return (
      <div style={{ position: 'relative' }}>
        <CommonChartContext.Provider value={{shareInfo}}>
          <EChartsContext.Provider value={{echartsRef}}>
            <ECharts
              option={option}
              {...defaultProps}
              {...props}
              notMerge
              lazyUpdate
              ref={echartsRef}
            />
            <Fab
              size='small'
              sx={{
                position: 'absolute',
                right: 24,
                top: 24,
                zIndex: 'var(--ifm-z-index-fixed-mui)',
                opacity: 0.2,
                ':hover': {
                  opacity: 1
                }
              }}
              onClick={handleShowDebugModel} disabled={shareBtnDisabled}
            >
              <ShareIcon />
            </Fab>
            <ShareDialog open={showDebugModel} onClose={handleCloseDebugModel} />
          </EChartsContext.Provider>
        </CommonChartContext.Provider>
      </div>
    );
  };
}