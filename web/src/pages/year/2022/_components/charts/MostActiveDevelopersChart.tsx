import React from "react";
import Chart, { ChartProps } from "@site/src/components/Chart";
import data from '../../_charts/developers.json';
import { defaultColors } from "@site/src/pages/year/2022/_components/charts/colors";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useThemeMediaQuery } from "@site/src/hooks/theme";
import useIsLarge from "@site/src/pages/year/2022/_components/hooks/useIsLarge";

function years(from, to: number): string[] {
  const arr: string[] = [];
  for (let i = from, j = 0; i <= to; i++, j++) {
    arr[j] = String(i);
  }
  return arr;
}

export default function MostActiveDevelopersChart(props: Omit<ChartProps, 'once' | 'data' | 'aspect'>) {
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
        },{
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
              color: '#E0E0E080',
              font: {
                family: 'JetBrains Mono',
                size: 14,
                weight: 'bold',
              }
            }
          }
        },
        plugins: {
          datalabels: {
            color: '#E0E0E080',
            font: {
              family: 'JetBrains Mono',
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
              filter: (item) => item.datasetIndex >= 1,
              color: '#E0E0E080',
              font: {
                size: 14,
                family: 'JetBrains Mono',
              },
              boxWidth: 18,
              boxHeight: 18,
              padding: 10,
            },
            position: 'bottom',
            align: 'start',
          },
          tooltip: {
            titleColor: '#BFBFBF',
            titleFont: {
              size: 14,
              family: 'JetBrains Mono',
              weight: 'bold',
            },
            bodyFont: {
              size: 18,
              family: 'JetBrains Mono'
            },
            boxPadding: 8,
            padding: 12,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
          },
        }
      }}
      plugins={[ChartDataLabels]}
      {...props}
    />
  );
}