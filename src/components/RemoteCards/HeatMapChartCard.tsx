import * as React from "react";
import {useMemo} from "react";
import {useRemoteData} from "../RemoteCharts/hook";
import BasicCard, {BaseChartCardProps} from "./BasicCard";

import {SeriesOption} from "echarts";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ECharts from "../ECharts";

export interface HeatMapChartCardProps extends BaseChartCardProps {
  xAxisColumnName: string,
  yAxisColumnName: string,
  valueColumnName: string,
  series: SeriesOption[],
  onZoneChange: (e) => void
  zone: number
}

const hours = [
  '0h', '1h', '2h', '3h', '4h', '5h', '6h',
  '7h', '8h', '9h', '10h', '11h',
  '12h', '13h', '14h', '15h', '16h', '17h',
  '18h', '19h', '20h', '21h', '22h', '23h'
];

const days = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'
];

export default function HeatMapChartCard(props: HeatMapChartCardProps) {
  const {
    queryName,
    params = {},
    series = [],
    shouldLoad,
    xAxisColumnName,
    yAxisColumnName,
    valueColumnName,
    xAxis,
    yAxis,
    height,
    zone,
    onZoneChange
  } = props;
  const {data: res, loading, error} = useRemoteData(queryName, params, true, shouldLoad);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))


  const {data, min, max} = useMemo(() => {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    const arr = res?.data.map(((item) => {
      const value = Number(item[valueColumnName]);
      if (value > max) {
        max = value;
      }
      if (value < min) {
        min = value;
      }
      return [(item[xAxisColumnName] + zone + 24) % 24, item[yAxisColumnName], value];
    }))
    return {
      data: arr || [],
      min,
      max
    }
  }, [res, zone, isSmall]);

  const options = useMemo(() => {
    return {
      tooltip: {
        show: true
      },
      grid: isSmall
        ? {
          top: '2%',
          bottom: '2%',
          left: '2%',
          right: '2%',
          containLabel: true
        }
        : {
          top: '2%',
          bottom: '16%',
          left: '6%',
          right: '2%',
          containLabel: true
        },
      xAxis: Object.assign({
        type: 'category',
        data: hours,
        splitArea: {
          show: true
        },
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          fontSize: 13,
          fontWeight: 'bold',
          color: '#959aa9'
        },
        axisLabel: {
          color: '#959aa9',
          fontWeight: 'bold'
        },
        inverse: false
      }, xAxis),
      yAxis: Object.assign({
        type: 'category',
        data: days,
        splitArea: {
          show: true
        },
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          fontSize: 13,
          fontWeight: 'bold',
          color: '#959aa9'
        },
        axisLabel: {
          color: '#959aa9',
          fontWeight: 'bold',
          rotate: isSmall ? 0 : 0,
          fontSize: isSmall ? 8 : undefined
        },
        position: 'top',
      }, yAxis),
      visualMap: {
        show: !isSmall,
        min: min,
        max: max,
        orient: isSmall ? undefined : 'horizontal',
        left: 'center',
        bottom: 0,
      },
      series: series.map((s) => {
        return Object.assign({
          type: 'heatmap',
          data: data,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }, s);
      })
    }
  }, [data, isSmall])

  return <BasicCard {...props} loading={loading} error={error} query={queryName} data={res}>
    <ECharts
      aspectRatio={24 / 7}
      option={options}
      notMerge={false}
      lazyUpdate={true}
    />
  </BasicCard>;
}
