import * as React from "react";
import {useMemo} from "react";
import ReactECharts from 'echarts-for-react';
import useThemeContext from "@theme/hooks/useThemeContext";
import * as echarts from "echarts";
import {EChartsOption} from "echarts";
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import map from '@geo-maps/countries-land-10km';
import {alpha2ToGeo, alpha2ToTitle} from "../../lib/areacode";

if (!echarts.getMap('world')) {
  echarts.registerMap('world', map())
}

export interface WorldMapChartProps<T> {
  loading?: boolean
  data: T[]
  seriesName?: string
  dimensionColumnName: keyof T
  metricColumnName: keyof T
}

export default function WorldMapChart<T>(props: WorldMapChartProps<T>) {
  const {
    loading,
    data,
    seriesName = 'Count',
    dimensionColumnName,
    metricColumnName
  } = props;
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  const {isDarkTheme} = useThemeContext();

  const options: EChartsOption = useMemo(() => {
    const max = Math.max(data[0]?.[metricColumnName] as unknown as number ?? 0)

    return {
      geo: {
        roam: false,
        map: 'world',
        silent: true,
        zoom: 1.7,
        top: '35%',
        projection: {
          project: (point) => [point[0] / 180 * Math.PI, -Math.log(Math.tan((Math.PI / 2 + point[1] / 180 * Math.PI) / 2))],
          unproject: (point) => [point[0] * 180 / Math.PI, 2 * 180 / Math.PI * Math.atan(Math.exp(point[1])) - 90]
        }
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        show: true,
        type: 'scroll',
        left: 0,
        top: 'center',
        orient: "vertical"
      },
      series: data.map((item) => {
        const title = alpha2ToTitle(item[dimensionColumnName])
        const value = item[metricColumnName];
        const {long, lat} = alpha2ToGeo((item[dimensionColumnName] as any as string).toUpperCase()) || {}

        return {
          type: "effectScatter",
          geoIndex: 0,
          coordinateSystem: 'geo',
          name: title,
          encode: {
            lng: 0,
            lat: 1,
            value: 2,
            tooltip: [3, 2]
          },
          data: [[long, lat, value, title]],
          symbolSize: function (val) {
            return 1 + Math.sqrt(val[2] / max) * 24;
          },
        }
      }),
      grid: {
        left: 16,
        top: 16,
        bottom: 16,
        right: 16,
        containLabel: true
      },
    }
  }, [data, isDarkTheme, isSmall])

  return (
    <ReactECharts
      showLoading={loading}
      option={options}
      notMerge={true}
      lazyUpdate={true}
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
    />
  )
}
