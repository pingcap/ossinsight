import * as React from "react";
import {useRemoteData} from "../RemoteCharts/hook";
import {useEffect, useMemo, useState} from "react";
import ReactECharts from 'echarts-for-react';
import useThemeContext from "@theme/hooks/useThemeContext";
import BasicCard, {BaseChartCardProps} from "./BasicCard";
import {SeriesOption} from "echarts";
import BrowserOnly from "@docusaurus/BrowserOnly";

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
  const {data: res, loading, error} = useRemoteData(queryName, params, true, shouldLoad);
  const {isDarkTheme} = useThemeContext();
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(res?.data || []);
  }, [res]);

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
        left: '20px',
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
        left: '5%',
        right: '1%',
        top: '40px',
        bottom: '50px'
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
            show: true,
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
