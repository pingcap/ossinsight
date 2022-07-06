import {
  axisTooltip,
  bar,
  dataZoom,
  legend,
  standardDataset,
  timeAxis,
  title,
  topBottomLayoutGrid,
  utils,
  valueAxis,
} from '../options';
import {withChart} from '../chart';

// lines of code
export type PushesAndCommitsData = {
  event_month: string
  pushes: number
  commits: number
}


export const PushesAndCommitsChart = withChart<PushesAndCommitsData>(({
  title: propsTitle, data, compareData, repoName, comparingRepoName,
}) => ({
  grid: topBottomLayoutGrid(),
  dataset: standardDataset(),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: legend(),
  xAxis: utils.template(({id}) => timeAxis<'x'>(id, {gridId: id})),
  yAxis: utils.template(({id}) => valueAxis<'y'>(id, {name: 'Count', gridId: id})),
  series: utils.template(({id, datasetId}) => [
    bar('event_month', 'pushes', {
      xAxisId: id,
      yAxisId: id,
      emphasis: {focus: 'series'},
      datasetId,
      barMaxWidth: 4,
    }),
    bar('event_month', 'commits', {
      xAxisId: id,
      yAxisId: id,
      emphasis: {focus: 'series'},
      datasetId,
      barMaxWidth: 4,
    }),
  ]),
  tooltip: axisTooltip('cross'),
}), {
  aspectRatio: 16 / 9,
});
