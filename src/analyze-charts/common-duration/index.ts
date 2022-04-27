import {EChartsOption} from 'echarts';
import {
  axisTooltip,
  bar,
  line,
  originalDataset,
  timeAxis,
  valueAxis,
  title, dataZoom, boxplot, logAxis,
} from '../options';
import {withChart} from '../chart';
import prettyMs from 'pretty-ms';

// lines of code
export type PrDurationData = {
  event_month: string
  p0: number
  p25: number
  p50: number
  p75: number
  p100: number
}

const fmtHours = (hours: number) => prettyMs(hours * 60 * 60 * 1000, {unitCount: 1});

export const DurationChart = withChart<PrDurationData>(({title: propsTitle, data}) => ({
  dataset: originalDataset(data),
  xAxis: timeAxis<'x'>(),
  yAxis: logAxis<'y'>(undefined, {
    // max: ({min, max}) => (min + max / 2).toFixed(0)
    axisLabel: {formatter: fmtHours},
  }),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  legend: {show: true},
  series: boxplot('event_month', ['p0', 'p25', 'p50', 'p75', 'p100'], {name: 'boxplot'}),
  tooltip: axisTooltip('shadow', {
    renderMode: 'html',
    formatter: params => {
      const {value} = params[0]
      return `
        <b>min</b>: ${fmtHours(value.p0)}
        <br/>
        <b>p25</b>: ${fmtHours(value.p25)}
        <br/>
        <b>medium</b>: ${fmtHours(value.p50)}
        <br/>
        <b>p75</b>: ${fmtHours(value.p75)}
        <br/>
        <b>max</b>: ${fmtHours(value.p100)}
      `
    }
  }),
}), {
  aspectRatio: 16 / 9,
});

