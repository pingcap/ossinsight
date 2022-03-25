import useThemeContext from "@theme/hooks/useThemeContext";
import {EChartsOption} from "echarts";
import React, {useMemo} from "react";
import ReactECharts from "echarts-for-react";

interface ZScoreChartProps {
  data: {
    name: string
    z_score: number
    z_score_star: number
    z_score_user: number
    z_score_pr: number
  }[]
  loading?: boolean
}


export default function ZScoreChart({data, loading}: ZScoreChartProps) {
  const {isDarkTheme} = useThemeContext();

  const option: EChartsOption = useMemo(() => {
    return {
      legend: {
        show: true
      },
      tooltip: {
        show: true,
        trigger: "axis",
        axisPointer: {
          type: 'shadow'
        }
      },
      yAxis: {
        type: "category",
        data: data.map(data => data.name),
        inverse: true
      },
      xAxis: [{
        name: 'z-score',
        axisLabel: {
          show: true
        }
      }],
      grid: {
        containLabel: true,
        left: 8
      },
      series: [
        {
          name: 'z-score',
          type: 'bar',
          data: data.map(data => data.z_score)
        },
        {
          name: 'z-score star',
          type: 'bar',
          data: data.map(data => data.z_score_star),
          stack: 'base',
          itemStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'z-score user',
          type: 'bar',
          data: data.map(data => data.z_score_user),
          stack: 'base',
          itemStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'z-score pr',
          type: 'bar',
          data: data.map(data => data.z_score_pr),
          stack: 'base',
          itemStyle: {
            opacity: 0.5
          }
        }
      ]
    }
  }, [data])

  return (
    <ReactECharts
      showLoading={loading}
      notMerge={true}
      lazyUpdate={true}
      option={option}
      style={{
        width: '100%',
        height: data.length * 30,
        overflow: 'hidden'
      }}
      theme={isDarkTheme ? 'dark' : 'vintage'}
      opts={{
        devicePixelRatio: window?.devicePixelRatio ?? 1,
        renderer: 'canvas',
        locale: 'en'
      }}
    />
  )
}