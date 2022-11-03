import Chart, { ChartProps } from '@site/src/components/Chart';
import React from 'react';
import PieOutLabelPlugin from './PieOutLabelPlugin';

export default function PieChart ({ sx }: Pick<ChartProps, 'sx'>) {
  return (
    <Chart<'pie'>
      sx={sx}
      type="pie"
      data={{
        labels: ['Weekdays', 'Weekends'],
        datasets: [{
          data: [77.73, 22.27],
          backgroundColor: ['#DD6B66', '#7289AB'],
        }],
      }}
      plugins={[
        PieOutLabelPlugin,
      ]}
      options={{
        responsive: true,
        plugins: {
          outlabel: {
            lineThickness: 5,
            label: {
              color: '#BFBFBF',
              font: {
                weight: 'bold',
                size: 24,
              },
            },
            value: {
              color: '#FFFFFF',
              font: {
                weight: 'bold',
                size: 36,
              },
            },
          },
        },
      }}
    />
  );
}
