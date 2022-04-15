import * as React from "react";
import {useMemo} from "react";
import {useRemoteData} from "../RemoteCharts/hook";
import useThemeContext from "@theme/hooks/useThemeContext";
import BasicCard, {BaseChartCardProps} from "./BasicCard";
import {SeriesOption} from "echarts";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ECharts from "../ECharts";

export interface LineAreaBarChartProps extends BaseChartCardProps {
  seriesColumnName: string,
  series: SeriesOption[],
}

export default function LineAreaBarChartCard(props: LineAreaBarChartProps) {
  const {
    queryName,
    params: {repoId1, repoId2} = {},
    series: originalSeries = [],
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
  const remote1 = useRemoteData(queryName, {repoId: repoId1}, true, !!repoId1);
  const remote2 = useRemoteData(queryName, {repoId: repoId2}, true, !!repoId2);
  const {isDarkTheme} = useThemeContext();

  const series = useMemo(() => {
    return originalSeries.map((item, i) => ({
      name: item.name ?? `repo ${i + 1}`,
      data: [remote1, remote2][i].data?.data ?? []
    }))
  }, [originalSeries, remote1.data, remote2.data])

  const options = useMemo(() => {
    return {
      dataset: [
        ...series.map((s, i) => {
          return {
            id: i,
            source: s.data,
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
      series: series.map((s, i) => {
        return {
          type: 'line',
          name: s.name,
          datasetId: i,
          label: {
            show: !isSmall,
            position: 'top',
            fontWeight: 'bold',
            color: '#4e5771',
            formatter: (params) => {
              const {dataIndex = 0, data = []} = params;
              const show = (dataIndex % 3) === 0 || (dataIndex === data.length - 1);
              return show ? data[yAxis.name] : '';
            }
          },
          smooth: true,
          showSymbol: false,
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
  }, [series, isDarkTheme, isSmall])

  return <BasicCard {...props} shouldLoad={repoId1 || repoId2} loading={false} error={remote1.error ?? remote2.error}
                    query={queryName}>
    <ECharts
      aspectRatio={isSmall ? (16 / 9) : (26 / 9)}
      showLoading={remote1.loading || remote2.loading}
      option={options}
      notMerge={false}
      lazyUpdate={true}
    />
  </BasicCard>;
}
