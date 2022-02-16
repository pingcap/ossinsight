import {useRemoteData} from "../hook";
import React, {useMemo} from 'react';
// import the core library.
import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
// Import charts, all with Chart suffix
import {BarChart,} from 'echarts/charts';
// import components, all suffixed with Component
import {GridComponent, TitleComponent, TooltipComponent,} from 'echarts/components';
// Import renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import {CanvasRenderer,} from 'echarts/renderers';
import Alert from "@mui/material/Alert";
import Skeleton from '@mui/material/Skeleton';
import Box from "@mui/material/Box";
import CodeBlock from '@theme/CodeBlock';

// Register the required components
echarts.use(
  [TitleComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer]
);


export function EventsHistoryRemoteChart({repo, event, n, years, size = 30, clear = false}) {
  const {data, error} = useRemoteData("events-history", {repo, event, n, years})

  const options = useMemo(() => {
    if (!data) {
      return undefined
    }
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        containLabel: true,
        left: 0,
        top: clear ? 0 : 16,
        bottom: clear ? 0 : 16
      },
      xAxis: {
        type: 'value',
        position: 'top'
      },
      yAxis: {
        type: 'category',
        data: data.data.map(d => d.repo_name),
        inverse: true,
        axisLabel: {
          rotate: 0,
          formatter: function (value, index) {
            return value.split('/')[1];
          }
        }
      },
      series: [
        {
          name: 'Count',
          data: data.data.map(d => d.events_count),
          type: 'bar',
          barWidth: clear ? size / 2 : size,
          itemStyle: {
            color: '#ffe39f',
            borderColor: '#786837',
            opacity: 0.7
          }
        }
      ]
    }
  }, [data, repo, event, n, years])

  if (data) {
    const height = n * (size * (clear ? 1 : 1.5))
    const chart = (
      <ReactEChartsCore
        echarts={echarts}
        option={options}
        notMerge={true}
        lazyUpdate={true}
        theme={"theme_name"}
        style={{
          height
        }}
        opts={{
          devicePixelRatio: window?.devicePixelRatio ?? 1,
          renderer: 'canvas',
          height: height,
          width: 'auto',
          locale: 'en'
        }}
        onEvents={{
          'click': params => {
            if ('name' in params) {
              window.open(`https://github.com/${params.name}`).then()
            }
          }
        }}
      />
    )

    if (clear) {
      return chart
    }

    return (
      <>
        {chart}
        {renderCodes(data.sql)}
      </>
    )
  } else if (error) {
    return <Alert severity='error'>Request failed ${error?.message ?? ''}</Alert>
  } else {
    return (
      <Box sx={{p: clear ? 0 : 8, height: 200}}>
        <Skeleton width="80%" />
        <Skeleton width="70%" />
        <Skeleton width="50%" />
        <Skeleton width="45%" />
        <Skeleton width="25%" />
        <Skeleton width="10%" />
      </Box>
    )
  }
}

const renderCodes = sql => {
  let content = undefined
  if (!sql) {
    content = (
      <Box sx={{pt: 0.5}}>
        <Skeleton width="80%" />
        <Skeleton width="50%" />
        <Skeleton width="70%" />
      </Box>
    )
  } else {
    content = (
      <CodeBlock className='language-sql'>
        {sql}
      </CodeBlock>
    )
  }
  return content
}
