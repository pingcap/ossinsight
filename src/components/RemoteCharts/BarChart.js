import React, {useMemo} from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import useThemeContext from '@theme/hooks/useThemeContext';
import {registerThemeDark, registerThemeVintage} from "./theme";

registerThemeVintage();
registerThemeDark();

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
        left: clear ? 0 : 8,
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
        }
      ]
    }
  }, [data, ...deps, categoryIndex, valueIndex, size, clear])

  const height = loading ? 400 : n * (size * (clear ? 1 : 1.5))

  const opts = useMemo(() => {
    return {
      devicePixelRatio: window?.devicePixelRatio ?? 1,
      renderer: 'canvas',
      height: height,
      width: 'auto',
      locale: 'en'
    }
  }, [height])

  const onEvents = useMemo(() => {
    return {
      'click': params => {
        if ('name' in params) {
          window.open(`https://github.com/${params.name}`).then()
        }
      }
    }
  }, [])

  const {isDarkTheme} = useThemeContext();

  return (
    <ReactEChartsCore
      showLoading={loading}
      echarts={echarts}
      option={options}
      notMerge={true}
      lazyUpdate={true}
      theme={isDarkTheme ? 'dark' : 'vintage'}
      style={{
        height,
        marginBottom: 16,
        borderRadius: 'var(--ifm-global-radius)',
        overflow: 'hidden'
      }}
      opts={opts}
      onEvents={onEvents}
    />
  )
}

