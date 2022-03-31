import * as echarts from "echarts/core";
import {GridComponent, TitleComponent, TooltipComponent} from "echarts/components";
import {PieChart as EPieChart} from "echarts/charts";
import {CanvasRenderer} from "echarts/renderers";
import {useTheme} from "@mui/material/styles";
import useThemeContext from "@theme/hooks/useThemeContext";
import * as React from "react";
import {useMemo} from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import ReactECharts from "echarts-for-react";
import {TextCommonOption} from "echarts/types/src/util/types";

echarts.use(
  [TitleComponent, TooltipComponent, GridComponent, EPieChart, CanvasRenderer]
);

export interface PieChartProps<T> {
  seriesName?: string
  data: T[]
  loading?: boolean
  deps?: unknown[]
  categoryIndex: keyof T
  valueIndex: keyof T
  type?: 'repo' | 'owner' | 'lang' | false // for click
  rich?: Record<string, TextCommonOption>
}

export default function PieChart<T>({
  seriesName,
  loading,
  data,
  categoryIndex,
  valueIndex,
  deps
}: PieChartProps<T>) {
  const {isDarkTheme} = useThemeContext();

  const options = useMemo(() => {
    return {
      tooltip: Object.assign({
        trigger: 'item'
      }),
      legend: Object.assign({
        type: 'scroll',
        orient: 'vertical',
        right: '20px',
        top: 20,
        bottom: 20,
        x: "right",
        formatter: '{name}',
      }),
      series: {
        type: 'pie',
        name: seriesName,
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: isDarkTheme ? '#1e1e1f' : '#ffffff',
          borderWidth: 0
        },
        label: {
          show: false,
          position: 'center',
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
            formatter: '{b}\n\n{c}'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map((item) => {
          const name = item[categoryIndex];
          const value = item[valueIndex];

          return {
            value: value,
            name: name
          };
        })
      },
      grid: {
        left: 16,
        top: 16,
        bottom: 16,
        right: 16,
        containLabel: true
      },
    }
  }, [data, ...deps, categoryIndex, valueIndex])

  return (
    <BrowserOnly>
      {() => <ReactECharts
        option={options}
        lazyUpdate={true}
        showLoading={loading}
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: '16 / 9',
          overflow: 'hidden'
        }}
        theme={isDarkTheme ? 'dark' : 'vintage'}
        opts={{
          devicePixelRatio: window?.devicePixelRatio ?? 1,
          renderer: 'canvas',
          locale: 'en'
        }}
      />}
    </BrowserOnly>
  )
}