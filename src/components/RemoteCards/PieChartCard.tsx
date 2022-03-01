import * as React from "react";
import {useRemoteData} from "../RemoteCharts/hook";
import {useEffect, useMemo, useState} from "react";
import ReactECharts from 'echarts-for-react';
import useThemeContext from "@theme/hooks/useThemeContext";
import BasicCard, {BaseChartCardProps} from "./BasicCard";
import {PieSeriesOption} from "echarts";
import BrowserOnly from "@docusaurus/BrowserOnly";

export interface PieSeriesExtendOption extends PieSeriesOption {
  nameMap?: (name: string) => string;
}

export interface PieChartCardProps extends BaseChartCardProps {
  dimensionColumnName: string,
  metricColumnName: string,
  series: PieSeriesExtendOption[],
}

export default function PieChartCard(props: PieChartCardProps) {
  const {
    queryName,
    params = {},
    series = [],
    legend,
    tooltip,
    shouldLoad,
    xAxis,
    yAxis,
    grid,
    height,
    dimensionColumnName,
    metricColumnName
  } = props;
  const {data: res, loading, error} = useRemoteData(queryName, params, true, shouldLoad);
  const {isDarkTheme} = useThemeContext();
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(res?.data || []);
  }, [res]);

  const options = useMemo(() => {
    return {
      tooltip: Object.assign({
        trigger: 'item'
      }, tooltip),
      legend: Object.assign({
        type: 'scroll',
        orient: 'vertical',
        right: '20px',
        top: 20,
        bottom: 20,
        x: "right",
        formatter: '{name}',
      }, legend),
      series: series.filter((s) => {
        return s?.name != null;
      }).map((s) => {
        return Object.assign({
          type: 'pie',
          radius: ['50%', '90%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: isDarkTheme ? '#1e1e1f' : '#ffffff',
            borderWidth: 4
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
            const name = s.nameMap !== undefined ? s.nameMap(item[dimensionColumnName]) : item[dimensionColumnName];
            const value = item[metricColumnName];

            return {
              value: value,
              name: name
            };
          })
        }, s)
      }),
      xAxis: xAxis,
      yAxis: yAxis,
      grid: Object.assign({
        left: '160px'
      }, grid),
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
  </BasicCard>
}
