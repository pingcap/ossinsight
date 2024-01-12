import React, { useMemo } from 'react';
import { DatasetOption } from 'echarts/types/dist/shared';
import type { EChartsOption, SeriesOption } from 'echarts';
import ECharts from '../ECharts';

interface DynamicLineChartProps {
  data: any[];
  loading: boolean;
  aspectRatio?: number;
  xIndex?: string;
  yIndex?: string;
  seriesIndex?: string;
}

const DEFAULT_ASPECT_RATIO = 16 / 9;
const DEFAULT_X_INDEX = 'every_year';
const DEFAULT_Y_INDEX = 'stars';
const DEFAULT_SERIES_INDEX = 'series_name';
const DEFAULT_SERIES_VALUE = 'default_series';

export default function DynamicLineChart (props: DynamicLineChartProps) {
  const {
    data,
    loading,
    aspectRatio = DEFAULT_ASPECT_RATIO,
    xIndex = DEFAULT_X_INDEX,
    yIndex = DEFAULT_Y_INDEX,
    seriesIndex = DEFAULT_SERIES_INDEX,
  } = props;

  const seriesData = useMemo(() => {
    if (seriesIndex === DEFAULT_SERIES_INDEX) {
      return [DEFAULT_SERIES_VALUE];
    } else {
      return Array.from(new Set(data.map(row => row[seriesIndex])));
    }
  }, [data]);

  const datasets: DatasetOption[] = useMemo(() => {
    let source = [];
    if (seriesIndex === DEFAULT_SERIES_INDEX) {
      source = ([[xIndex, yIndex, DEFAULT_SERIES_INDEX]] as any).concat(data.map((item) => {
        return [item[xIndex], parseInt(item[yIndex]), DEFAULT_SERIES_VALUE];
      }));
    } else {
      source = ([[xIndex, yIndex, seriesIndex]] as any).concat(data.map((item) => {
        return [item[xIndex], parseInt(item[yIndex]), item[seriesIndex]];
      }));
    }

    const datasets: DatasetOption[] = [{
      id: 'raw',
      source,
    }, {
      transform: {
        type: 'sort',
        config: {
          dimension: 'year', order: 'asc',
        },
      },
    }];

    return datasets.concat(seriesData.map(series => ({
      id: series,
      fromDatasetId: 'raw',
      transform: {
        type: 'filter',
        config: {
          and: [{
            dimension: seriesIndex, '=': series,
          }],
        },
      },
    })));
  }, [data, seriesData]);

  const series: SeriesOption[] = useMemo(() => {
    return seriesData.map(series => ({
      type: 'line',
      datasetId: series,
      showSymbol: false,
      name: series,
      endLabel: {
        show: true,
        formatter: function (params) {
          const { value } = params;
          return value[1];
        },
      },
      labelLayout: {
        moveOverlap: 'shiftY',
      },
      emphasis: {
        focus: 'series',
      },
      smooth: true,
      lineStyle: {
        cap: 'round',
      },
      encode: {
        x: 'year',
        y: yIndex,
        label: [yIndex],
        itemName: xIndex,
        tooltip: [yIndex],
        val: yIndex,
      },
    }));
  }, [seriesData]);

  const option: EChartsOption = useMemo(() => {
    return {
      animationDuration: 10000,
      dataset: datasets,
      title: {
        text: '',
        left: 'center',
      },
      tooltip: {
        order: 'valueDesc',
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        nameLocation: 'end',
      },
      yAxis: {
        name: yIndex,
      },
      grid: {
        containLabel: true,
        right: '30%',
        left: 0,
      },
      series,
    };
  }, [datasets, series]);

  return (
    <ECharts
      showLoading={loading}
      option={option}
      aspectRatio={aspectRatio}
      lazyUpdate
      notMerge={false}
    />
  );
}
