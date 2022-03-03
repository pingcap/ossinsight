import * as React from "react";
import {useMemo} from "react";
import {useRemoteData} from "../RemoteCharts/hook";
import ReactECharts from 'echarts-for-react';
import useThemeContext from "@theme/hooks/useThemeContext";
import BasicCard, {BaseChartCardProps} from "./BasicCard";
import {PieSeriesOption} from "echarts";
import BrowserOnly from "@docusaurus/BrowserOnly";
import CompareCard from "./CompareCard";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export interface PieSeriesExtendOption extends PieSeriesOption {
  nameMap?: (name: string) => string;
}

export interface PieChartCardProps extends Omit<BaseChartCardProps, 'params'> {
  params1: Record<string, unknown>
  params2: Record<string, unknown>
  dimensionColumnName: string,
  metricColumnName: string,
  series: PieSeriesExtendOption[],
}

export default function PieChartCompareCard(props: PieChartCardProps) {
  const {
    queryName,
    params1,
    params2,
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
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const req1 = useRemoteData(queryName, params1, true, params1 && shouldLoad);
  const req2 = useRemoteData(queryName, params2, true, params2 && shouldLoad);
  const {isDarkTheme} = useThemeContext();

  const [data1, data2] = useMemo(() => {
    return [
      req1.data?.data.sort((a, b) => Math.sign(b.count - a.count)) ?? [],
      req2.data?.data.sort((a, b) => Math.sign(b.count - a.count)) ?? []]
  }, [req1.data, req2.data])

  const loading = useMemo(() => {
    return req1.loading || req2.loading
  }, [req1.loading, req2.loading])

  const error = useMemo(() => {
    return req1.error || req2.error
  }, [req1.error, req2.error])

  const options = useMemo(() => {
    return {
      tooltip: Object.assign({
        trigger: 'item'
      }, tooltip),
      legend: Object.assign({
        type: 'scroll',
        orient: isSmall ? 'horizontal' : 'vertical',
        right: '20px',
        top: 20,
        bottom: 20,
        x: "right",
        formatter: '{name}',
      }, legend),
      series: series.filter((s) => {
        return s?.name != null;
      }).flatMap((s) => {
        return [data1, data2].map((data, n) => Object.assign({
          type: 'pie',
          name: [params1, params2][n].repoName,
          radius: ['40%', '70%'],
          center: [`${50 + 40 * (n - 0.5)}%`, '55%'],
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
            const name = s.nameMap !== undefined ? s.nameMap(item[dimensionColumnName]) : item[dimensionColumnName];
            const value = item[metricColumnName];

            return {
              value: value,
              name: name
            };
          })
        }, s))
      }),
      xAxis: xAxis,
      yAxis: yAxis,
      grid: Object.assign({
        left: 16,
        top: 16,
        bottom: 16,
        right: 16,
        containLabel: true
      }, grid),
    }
  }, [data1, data2, isDarkTheme, isSmall])

  return <CompareCard {...props} loading={loading} error={error} query={queryName} datas={[req1.data, req2.data]}>
    <BrowserOnly>
      {() => <ReactECharts
        option={options}
        notMerge={true}
        lazyUpdate={true}
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: isSmall ? '16 / 9' : '26 / 9',
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
  </CompareCard>
}
