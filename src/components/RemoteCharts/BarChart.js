import React, {useMemo} from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import {BarChart,} from 'echarts/charts';
import {GridComponent, TitleComponent, TooltipComponent,} from 'echarts/components';
import {CanvasRenderer,} from 'echarts/renderers';
import * as echarts from "echarts/core";

// Register the required components
echarts.use(
  [TitleComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer]
);

export default function ({data, loading, clear, size, n, deps, categoryIndex, valueIndex}) {
  const options = useMemo(() => {
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
        data: data.map(d => d[categoryIndex]),
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
          data: data.map(d => d[valueIndex]),
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
  }, [data, ...deps])

  const height = loading ? 400 : n * (size * (clear ? 1 : 1.5))

  return (
    <ReactEChartsCore
      showLoading={loading}
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


}