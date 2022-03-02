import * as React from "react";
import {useRemoteData} from "../RemoteCharts/hook";
import {useEffect, useMemo, useState} from "react";
import ReactECharts from 'echarts-for-react';
import useThemeContext from "@theme/hooks/useThemeContext";
import BasicCard, {BaseChartCardProps} from "./BasicCard";

import {SeriesOption} from "echarts";
import BrowserOnly from "@docusaurus/BrowserOnly";

export interface HeatMapChartCardProps extends BaseChartCardProps {
  xAxisColumnName: string,
  yAxisColumnName: string,
  valueColumnName: string,
  series: SeriesOption[],
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
    height
  } = props;
  const {data: res, loading, error} = useRemoteData(queryName, params, true, shouldLoad);
  const {isDarkTheme} = useThemeContext();
  const [data, setData] = useState([]);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(10);

  useEffect(() => {
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
      return [item[xAxisColumnName], item[yAxisColumnName], value];
    }))
    setMax(max);
    setMin(min);
    setData(arr || []);
  }, [res]);

  const options = useMemo(() => {
    return {
      tooltip: {
        position: 'top'
      },
      grid: {
        height: '80%',
        top: '3%',
        left: '5%',
        right: '3%',
        bottom: '1%'
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
          fontWeight: 'bold'
        },
      }, yAxis),
      visualMap: {
        min: min,
        max: max,
        orient: 'horizontal',
        left: 'center',
      },
      series: series.map((s) => {
        return Object.assign({
          type: 'heatmap',
          data: data,
          label: {
            show: true
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
  }, [data, isDarkTheme])

  return <BasicCard {...props} loading={loading} error={error} query={queryName} data={res}>
    <BrowserOnly>
      {() => <ReactECharts
        option={options}
        notMerge={true}
        lazyUpdate={true}
        style={{
          height: height,
          overflow: 'hidden'
        }}
        theme={isDarkTheme ? 'compare-dark' : 'compare-light'}
        opts={{
          devicePixelRatio: window?.devicePixelRatio ?? 1,
          renderer: 'canvas',
          width: 'auto',
          locale: 'en'
        }}
      />}
    </BrowserOnly>
  </BasicCard>;
}
