import { AsyncData, RemoteData } from '../../components/RemoteCharts/hook';
import {
  axisTooltip,
  boxplot,
  dataZoom,
  formatMonth,
  logAxis,
  originalDataset,
  standardDataset,
  timeAxis,
  title, topBottomLayoutGrid,
  utils,
} from '../options';
import {withChart} from '../chart';
import prettyMs from 'pretty-ms';
import {alpha} from '@mui/material';

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

function getMax (data: AsyncData<RemoteData<unknown, PrDurationData>>): number | undefined {
  return data.data?.data.reduce((prev, current) => Math.max(prev, current.p100), 0)
}

function getMin (data: AsyncData<RemoteData<unknown, PrDurationData>>): number | undefined {
  return data.data?.data.reduce((prev, current) => Math.min(prev, current.p0 > 0 ? current.p0 : prev), Number.MAX_SAFE_INTEGER)
}

export const DurationChart = withChart<PrDurationData>(({title: propsTitle, data}) => ({
  dataset: standardDataset(),
  grid: topBottomLayoutGrid(),
  xAxis: utils.template(({id}) => timeAxis<'x'>(id, {gridId: id})),
  yAxis: utils.template<PrDurationData>(({id, data}) => logAxis<'y'>(id, {
    name: 'Duration',
    gridId: id,
    axisLabel: {formatter: fmtHours},
    axisPointer: {
      label: {
        formatter: ({value}) => fmtHours(Number(value)),
      },
    },
    max: Math.pow(10, Math.ceil(Math.log10(getMax(data)))),
    min: Math.pow(10, Math.floor(Math.log10(getMin(data))))
  })),
  dataZoom: dataZoom(),
  title: title(propsTitle),
  series: utils.template(({id, datasetId}) => boxplot('event_month', ['p0', 'p25', 'p50', 'p75', 'p100'], {
    datasetId,
    xAxisId: id,
    yAxisId: id,
    itemStyle: {
      color: alpha('#dd6b66', .3),
      borderWidth: 1,
    },
    boxWidth: ['40%', '40%']
  })),
  tooltip: axisTooltip('cross', {
    renderMode: 'html',
    formatter: params => {
      const {value, marker} = params[0];
      return `
        ${marker}
        <span>${formatMonth(value.event_month)}</span>
        <br/>
        <b>min</b>: ${fmtHours(value.p0)}
        <br/>
        <b>p25</b>: ${fmtHours(value.p25)}
        <br/>
        <b>medium</b>: ${fmtHours(value.p50)}
        <br/>
        <b>p75</b>: ${fmtHours(value.p75)}
        <br/>
        <b>max</b>: ${fmtHours(value.p100)}
      `;
    },
  }),
}), {
  aspectRatio: 16 / 9,
});

