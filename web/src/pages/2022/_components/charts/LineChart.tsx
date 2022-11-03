import Chart, { ChartProps } from '@site/src/components/Chart';
import React, { useMemo } from 'react';
import { defaultColors } from './colors';
import { ScriptableContext } from 'chart.js';
import useIsLarge from '../hooks/useIsLarge';
import theme from './theme';
import { notNullish } from '@site/src/utils/value';

interface BarChartProps<T> extends Pick<ChartProps, 'fallbackImage' | 'name' | 'sx'> {
  data: import('../../_charts/env').LineData<T>;
  footnote?: string;
}

const labeledData = function <T, L extends import('../../_charts/env').LineData<T>>(lineData: L): [Record<string, T[]>, string[]] {
  const labels: string[] = [];
  const record = lineData.data.reduce<Record<string, T[]>>((record, item) => {
    const label: string = item[lineData.label] as never;
    if (notNullish(record[label])) {
      record[label].push(item);
    } else {
      record[label] = [item];
      labels.push(label);
    }
    return record;
  }, {});
  return [record, labels];
};

const color = (context: ScriptableContext<'line'>) => defaultColors[context.datasetIndex % defaultColors.length];

export default function LineChart<T extends Record<string, any>> ({
  data,
  footnote,
  ...props
}: BarChartProps<T>) {
  const [record, labels] = useMemo(() => labeledData<T, BarChartProps<T>['data']>(data), [data]);
  const large = useIsLarge();

  return (
    <Chart<'line'>
      once
      aspect={large ? 4 / 3 : 1}
      {...props}
      type="line"
      data={{
        labels: data.x,
        datasets: labels.map(label => {
          return {
            data: record[label].map(item => item[data.y]),
            label,
            pointBorderColor: color,
            pointBackgroundColor: color,
            borderColor: color,
            borderWidth: 2,
            pointRadius: 3,
            pointBorderWidth: 0,
            pointHoverRadius: 5,
          };
        }),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: theme.grid.normal,
            ticks: {
              color: theme.color.ticks,
              font: theme.font.ticks,
              padding: 4,
            },
          },
          y: {
            grid: theme.grid.normal,
            ticks: {
              color: theme.color.ticks,
              font: theme.font.ticks,
              callback: value => `${value}${data.unit}`,
              padding: 4,
              maxTicksLimit: 7,
            },
          },
        },
        plugins: {
          subtitle: theme.subtitle(footnote),
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              boxHeight: 10,
              padding: 24,
              color: theme.color.legend,
              font: theme.font.legend,
            },
          },
          title: theme.title(props.name, 'white'),
          tooltip: {
            titleColor: theme.color.tooltipTitle,
            titleFont: theme.font.tooltipTitle,
            bodyFont: theme.font.tooltipBody,
            boxPadding: 8,
            padding: 12,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            callbacks: {
              label: item => {
                return `${item.dataset.label ?? 'undefined'}: ${item.dataset.data[item.dataIndex] as number}${data.unit}`;
              },
            },
          },
        },
      }}
    />
  );
}
