import {EChartsOption} from 'echarts';
import {
  axisTooltip,
  bar,
  line,
  originalDataset,
  timeAxis,
  valueAxis,
  title, dataZoom, boxplot,
} from '../options';
import {withChart} from '../chart';

// lines of code
export type PrDurationData = {
  event_month: string
  p0: number
  p25: number
  p50: number
  p75: number
  p100: number
}

export const PrDurationChart = withChart<PrDurationData>(({title: propsTitle, data}) => ({
  dataset: originalDataset(data),
  xAxis: timeAxis<'x'>(),
  yAxis: valueAxis<'y'>(undefined, {
    // max: ({min, max}) => (min + max / 2).toFixed(0)
  }),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: {show: true},
  series: [
    boxplot('event_month', ['p0', 'p25', 'p50', 'p75', 'p100'], { name: 'boxplot'}),
    line('event_month', 'p50', {showSymbol: false})
  ],
  tooltip: axisTooltip('line'),
}), {
  aspectRatio: 16 / 9,
});

