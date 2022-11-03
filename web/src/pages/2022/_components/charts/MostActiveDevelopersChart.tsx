import React from 'react';
import Chart, { ChartProps } from '@site/src/components/Chart';
import data from '../../_charts/developers.json';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import useIsLarge from '../hooks/useIsLarge';
import theme from './theme';
import { notNullish } from '@site/src/utils/value';

function years (from, to: number): string[] {
  const arr: string[] = [];
  for (let i = from, j = 0; i <= to; i++, j++) {
    arr[j] = String(i);
  }
  return arr;
}

interface MostActiveDevelopersChartProps extends Omit<ChartProps, 'once' | 'data' | 'aspect'> {
  footnote?: string;
}

export default function MostActiveDevelopersChart ({ footnote, ...props }: MostActiveDevelopersChartProps) {
  const large = useIsLarge();

  return (
    <Chart
      once
      aspect={large ? 16 / 9 : 4 / 3}
      data={{
        labels: years(2011, 2022),
        datasets: [{
          type: 'line',
          label: 'bot',
          data: data.map(item => item[2]),
          borderColor: '#FF6D62',
          borderWidth: 5,
          pointRadius: 0,
          pointBorderWidth: 0,
        }, {
          type: 'bar',
          label: 'bot',
          data: data.map(item => item[2]),
          stack: 'stack',
          backgroundColor: '#73B9BC80',
        }, {
          type: 'bar',
          label: 'human',
          data: data.map(item => item[1]),
          stack: 'stack',
          backgroundColor: '#B78DC180',
        }, {
          type: 'bar',
          label: 'not sure',
          data: data.map(item => item[0]),
          stack: 'stack',
          backgroundColor: '#7289AB80',
        }],
      }}
      options={{
        responsive: true,
        scales: {
          y: {
            display: false,
          },
          x: {
            ticks: {
              color: `${theme.color.ticks}80`,
              font: theme.font.ticks,
            },
          },
        },
        plugins: {
          datalabels: {
            color: `${theme.color.ticks}80`,
            font: {
              size: 12,
            },
            anchor: 'end',
            formatter: value => value === 0 ? '' : value,
            clamp: true,
            textAlign: 'left',
            align: 'start',
            display: context => context.dataset.type === 'bar',
            padding: 0,
          },
          legend: {
            labels: {
              filter: (item) => notNullish(item.datasetIndex) && item.datasetIndex >= 1,
              color: `${theme.color.legend}80`,
              font: theme.font.legend,
              boxWidth: 18,
              boxHeight: 18,
              padding: 10,
            },
            position: 'bottom',
            align: 'start',
          },
          tooltip: {
            titleColor: theme.color.tooltipTitle,
            titleFont: theme.font.tooltipTitle,
            bodyFont: theme.font.tooltipBody,
            boxPadding: 8,
            padding: 12,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
          },
          subtitle: theme.subtitle(footnote),
        },
      }}
      plugins={[ChartDataLabels]}
      {...props}
    />
  );
}
