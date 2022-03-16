import * as React from "react";
import {useMemo} from "react";
import {useRemoteData} from "../RemoteCharts/hook";
import ReactECharts from 'echarts-for-react';
import useThemeContext from "@theme/hooks/useThemeContext";
import BasicCard, {BaseChartCardProps} from "./BasicCard";
import {SeriesOption} from "echarts";
import BrowserOnly from "@docusaurus/BrowserOnly";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export interface LineAreaBarChartProps extends BaseChartCardProps {
  seriesColumnName: string,
  series: SeriesOption[],
}

export default function LineAreaBarChartCard(props: LineAreaBarChartProps) {
  const {
    queryName,
    params = {},
    series = [],
    shouldLoad,
    tooltip,
    grid,
    xAxis,
    yAxis,
    legend,
    seriesColumnName,
    height
  } = props;
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const {data: res, loading, error} = useRemoteData(queryName, params, true, shouldLoad);
  const {isDarkTheme} = useThemeContext();

  const data = useMemo(() => {
    return res?.data?.map(item => {
      item.repo_name = item.repo_name.toLowerCase()
      return item
    }) ?? []
  }, [res])

  const options = useMemo(() => {
    return {
      dataset: [
        {
          id: 'dataset_raw',
          source: data
        },
        ...series.map((s) => {
          return {
            id: `dataset_of_${s.name}`,
            fromDatasetId: 'dataset_raw',
            transform: {
              type: 'filter',
              config: {
                and: [
                  {dimension: seriesColumnName, '=': s.name}
                ]
              }
            }
          }
        })
      ],
      tooltip: Object.assign({
        trigger: 'axis',
      }, tooltip),
      legend: Object.assign({
        orient: 'horizontal',
        left: 'center',
        icon: 'circle',
        itemHeight: 10,
        itemWidth: 10,
        textStyle: {
          fontWeight: 'bold',
        },
        data: series.map((s) => {
          return s.name;
        })
      }, legend),
      grid: Object.assign({
        top: 48,
        bottom: 32,
        left: 24,
        right: 24,
        containLabel: true
      }, grid),
      xAxis: Object.assign({
        nameGap: 30,
        nameLocation: 'middle',
        nameTextStyle: {
          fontSize: 13,
          fontWeight: 'bold',
        },
        axisLabel: {
          fontWeight: 'bold',
        },
        axisLine: {
          lineStyle: {
            width: 2
          }
        },
        axisTick: {
          show: false
        },
      }, xAxis),
      yAxis: Object.assign({
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
        splitLine: {
          interval: 5,
          lineStyle: {
            type: [5, 10],
          }
        }
      }, yAxis),
      series: series.map((s) => {
        return {
          type: 'line',
          name: s.name,
          datasetId: `dataset_of_${s.name}`,
          label: {
            show: !isSmall,
            position: 'top',
            fontWeight: 'bold',
            color: '#4e5771',
            formatter: (params) => {
              const { dataIndex = 0, data = [] } = params;
              const show = (dataIndex % 3) === 0 || (dataIndex === data.length - 1);
              return show ? data[yAxis.name] : '';
            }
          },
          emphasis: {
            focus: 'series'
          },
          encode: {
            x: xAxis.name,
            y: yAxis.name,
            tooltip: [yAxis.name]
          },
        }
      })
    }
  }, [data, isDarkTheme, isSmall])

  return <BasicCard {...props} loading={loading || (shouldLoad && !res)} error={error} query={queryName} data={res}>
    <BrowserOnly>
      {() => res?.data?.length ? <ReactECharts
        option={options}
        showLoading={!res?.data?.length}
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
          width: 'auto',
          locale: 'en'
        }}
      /> : undefined}
    </BrowserOnly>
  </BasicCard>;
}
