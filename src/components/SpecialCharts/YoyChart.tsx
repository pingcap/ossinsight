import React, {useMemo} from "react";
import {EChartsOption} from "echarts";
import * as echarts from "echarts/core";
import {GridComponent, TitleComponent, TooltipComponent} from "echarts/components";
import {BarChart as EBarChart} from "echarts/charts";
import {CanvasRenderer} from "echarts/renderers";
import ECharts from "../ECharts";

// Register the required components
echarts.use(
  [TitleComponent, TooltipComponent, GridComponent, EBarChart, CanvasRenderer]
);

interface YoyChartProps {
  data: {
    name: string
    stars2020: number
    stars2021: number
    yoy: number
  }[]
  aspectRatio?: number
  loading?: boolean
}

export default function YoyChart({data, aspectRatio = 6 / 5, loading}: YoyChartProps) {
  const axis = useMemo(() => {
    // https://blog.csdn.net/qq_32862143/article/details/112969310
    const max1 = Math.max(...data.map(data => data.yoy))
    const min1 = Math.min(...data.map(data => data.yoy))
    const max2 = Math.max(...data.map(data => data.stars2020), ...data.map(data => data.stars2021))
    const min2 = Math.min(...data.map(data => data.stars2020), ...data.map(data => data.stars2021))

    const ratio = (max1 - min1) / (max2 - min2);
    let x1Min, x1Max, x2Min, x2Max: number

    if (max1 < max2 * ratio) {
      x1Max = max2 * ratio;
      x2Max = max2;
    } else {
      x1Max = max1;
      x2Max = max1 / ratio;
    }
    if (min1 < min2 * ratio) {
      x1Min = min1;
      x2Min = min1 / ratio;
    } else {
      x1Min = min2 * ratio;
      x2Min = min2;
    }

    return {max1, max2, min1, min2, x1Min, x2Min, x1Max, x2Max}
  }, [data])



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
        id: 0,
        name: 'stars',
        max: value => {
          const { max, min } = value;
          return Math.max(Math.abs(max), Math.abs(min)) * 1.2
        } ,
        min: value => {
          const { max, min } = value;
          return -Math.max(Math.abs(max), Math.abs(min)) * 1.2
        },
        axisLabel: {
          show: true
        }
      }, {
        id: 1,
        name: 'yoy',
        max: value => {
          const { max, min } = value;
          return Math.max(Math.abs(max), Math.abs(min)) * 1.2
        } ,
        min: value => {
          const { max, min } = value;
          return -Math.max(Math.abs(max), Math.abs(min)) * 1.2
        },
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
          name: 'stars2020',
          type: 'bar',
          data: data.map(data => data.stars2020),
          xAxisId: "0",
          itemStyle: { opacity: 0.3 }
        },
        {
          name: 'stars2021',
          type: 'bar',
          data: data.map(data => data.stars2021),
          xAxisId: "0",
          itemStyle: { opacity: 0.3 }
        },
        {
          name: 'yoy',
          type: 'bar',
          data: data.map(data => data.yoy),
          xAxisId: "1",
        }
      ]
    }
  }, [data, axis])

  return (
    <ECharts
      showLoading={loading}
      option={option}
      aspectRatio={aspectRatio}
      lazyUpdate
      notMerge={false}
    />
  )
}