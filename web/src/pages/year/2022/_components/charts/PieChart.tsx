import Chart, { ChartProps } from "@site/src/components/Chart";
import React from "react";
import PieOutLabelPlugin from "@site/src/pages/year/2022/_components/charts/PieOutLabelPlugin";

export default function PieChart({ sx }: Pick<ChartProps, 'sx'>) {
  return (
    <Chart<'pie'>
      sx={sx}
      type="pie"
      aspect={1}
      data={{
        labels: ['Weekdays', 'Weekends'],
        datasets: [{
          data: [77.5, 22.5],
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
                family: 'JetBrains Mono',
                weight: 'bold',
                size: 24,
              },
            },
            value: {
              color: '#FFFFFF',
              font: {
                family: 'JetBrains Mono',
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