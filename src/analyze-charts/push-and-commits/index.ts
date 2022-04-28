import {axisTooltip, bar, dataZoom, legend, originalDataset, timeAxis, title, valueAxis} from '../options';
import {withChart} from '../chart';

// lines of code
export type PushesAndCommitsData = {
  event_month: string
  pushes: number
  commits: number
}


export const PushesAndCommitsChart = withChart<PushesAndCommitsData>(({title: propsTitle, data}) => ({
  dataset: originalDataset(data),
  xAxis: timeAxis<'x'>(undefined),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: legend(),
  yAxis: valueAxis<'y'>(undefined, {name: 'Count'}),
  series: [
    bar('event_month', 'pushes', {emphasis: {focus: 'series'}}),
    bar('event_month', 'commits', {emphasis: {focus: 'series'}}),
  ],
  tooltip: axisTooltip('line'),
}), {
  aspectRatio: 16 / 9,
});
