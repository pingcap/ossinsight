import React, { useMemo } from 'react';
import { DatasetOption } from 'echarts/types/dist/shared';
import type { EChartsOption, SeriesOption } from 'echarts';
import ECharts from '../ECharts';

type RawData = {
  event_year: number;
  repo_name: string;
  stars: string;
};

interface DynamicStarsChartProps {
  data: RawData[];
  loading: boolean;
  aspectRatio?: number;
}

export default function DynamicStarsChart ({ data, aspectRatio = 16 / 9, loading }: DynamicStarsChartProps) {
  const repos = useMemo(() => {
    return Array.from(new Set(data.map(row => row.repo_name)));
  }, [data]);

  const datasets: DatasetOption[] = useMemo(() => {
    const datasets: DatasetOption[] = [{
      id: 'raw',
      source: ([['event_year', 'repo_name', 'stars']] as any)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .concat(data.map(({ event_year, repo_name, stars }) => ([event_year, repo_name, parseInt(stars)]))),
    }, {
      transform: {
        type: 'sort',
        config: { dimension: 'year', order: 'asc' },
      },
    }];

    return datasets.concat(repos.map(repo => ({
      id: repo,
      fromDatasetId: 'raw',
      transform: {
        type: 'filter',
        config: {
          and: [{ dimension: 'repo_name', '=': repo }],
        },
      },
    })));
  }, [data, repos]);

  const series: SeriesOption[] = useMemo(() => {
    return repos.map(repo => ({
      type: 'line',
      datasetId: repo,
      showSymbol: false,
      name: repo,
      endLabel: {
        show: true,
        formatter: function (params) {
          const { value } = params;
          return `${value[1] as string}: ${value[2] as string}`;
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
        y: 'stars',
        label: ['stars'],
        itemName: 'event_year',
        tooltip: ['stars'],
        val: 'stars',
      },
    }));
  }, [repos]);

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
        name: 'stars',
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
