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
      description: chartContext.description ?? '',
      keywords: [],
      hash: chartContext.hash,
      message: context.comparingRepoName
        ? `Comparing ${context.repoName} with ${context.comparingRepoName} | ${chartContext.title} | OSSInsight.io`
        : `Analyzing ${context.repoName} | ${chartContext.title} | OSSInsight.io`,
    }

    const ctx = {...context, ...chartContext, context: {} as Record<string, any>};

    dangerousSetCtx(ctx);
    const option = useOption(ctx, props.spec);
    if (ctx.context.DEBUG_PRINT_OPTION) {
      console.debug(option)
    }
    dangerousSetCtx(undefined);

    option.toolbox = {
      feature: {
        myShareChart: {
          show: !shareBtnDisabled,
          icon: 'path://M736,608a127.776,127.776,0,0,0-115.232,73.28l-204.896-117.056a30.848,30.848,0,0,0-9.696-3.2A127.68,127.68,0,0,0,416,512c0-6.656-0.992-13.088-1.984-19.456,0.608-0.32,1.28-0.416,1.856-0.768l219.616-125.472A127.328,127.328,0,0,0,736,416c70.592,0,128-57.408,128-128s-57.408-128-128-128-128,57.408-128,128c0,6.72,0.992,13.152,1.984,19.616-0.608,0.288-1.28,0.256-1.856,0.608l-219.616,125.472A127.328,127.328,0,0,0,288,384c-70.592,0-128,57.408-128,128s57.408,128,128,128a126.912,126.912,0,0,0,84.544-32.64,31.232,31.232,0,0,0,11.584,12.416l224,128c0.352,0.224,0.736,0.256,1.12,0.448C615.488,812.992,669.6,864,736,864c70.592,0,128-57.408,128-128s-57.408-128-128-128',
          onclick: handleShowDebugModel
        }
      }
    }

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
            <ShareDialog open={showDebugModel} onClose={handleCloseDebugModel} />
          </EChartsContext.Provider>
        </CommonChartContext.Provider>
      </div>
    );
  };
}