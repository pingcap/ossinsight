import {
  categoryAxis,
  heatmap,
  itemTooltip,
  leftRightLayoutGrid,
  legend,
  standardDataset,
  title,
  topBottomLayoutGrid,
  utils,
  visualMap,
} from '../options';
import { withChart } from '../chart';

// lines of code
export type TimeHeatData = {
  dayofweek: number;
  hour: number;
  pushes: number;
};

const hours = [
  '0h', '1h', '2h', '3h', '4h', '5h', '6h',
  '7h', '8h', '9h', '10h', '11h',
  '12h', '13h', '14h', '15h', '16h', '17h',
  '18h', '19h', '20h', '21h', '22h', '23h',
];

const days = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat',
];

const applyZone = (hour: number | string, zone: number): number => {
  return (Number(hour) + zone + 24) % 24;
};

const prepareData = (zone: number) => (data: TimeHeatData[]): TimeHeatData[] => {
  if (data.length === 0) {
    return [];
  }
  const newData = [...data];
  const boolMap: boolean[] = Array(24 * 7).fill(false, 0, 24 * 7);
  for (let i = 0; i < newData.length; i++) {
    const item = newData[i] = { ...newData[i] };
    item.hour = applyZone(item.hour, zone);
    boolMap[item.dayofweek + item.hour * 7] = true;
  }
  // eslint-disable-next-line @typescript-eslint/no-for-in-array
  for (const hour in hours) {
    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const day in days) {
      if (!boolMap[parseInt(day) + applyZone(parseInt(hour), zone) * 7]) {
        newData.push({
          dayofweek: parseInt(day),
          hour: applyZone(parseInt(hour), zone),
          pushes: 0,
        });
      }
    }
  }
  return newData;
};

export const TimeHeatChart = withChart<TimeHeatData, { zone: number }>(({
  title: propsTitle,
  data,
  isSmall,
}, { zone }) => ({
  dataset: standardDataset(prepareData(zone)),
  title: title(propsTitle),
  legend: legend(),
  grid: isSmall ? topBottomLayoutGrid() : leftRightLayoutGrid(),
  xAxis: utils.template(({ id }) => categoryAxis<'x'>(id, { gridId: id, data: hours, position: 'top' })),
  yAxis: utils.template(({ id }) => categoryAxis<'y'>(id, { gridId: id, data: days, inverse: true })),
  visualMap: utils.aggregate<TimeHeatData>(all => {
    const max = all.map(data => data.data?.data.reduce((prev, current) => Math.max(prev, current.pushes), 0) ?? 1).reduce((p, c) => Math.max(p, c), 0);
    return visualMap(0, max);
  }),
  series: utils.template(({ datasetId, id }) => heatmap('hour', 'dayofweek', 'pushes', {
    datasetId,
    xAxisId: id,
    yAxisId: id,
  })),
  tooltip: itemTooltip({
    renderMode: 'html',
    formatter: (params) => {
      const value = params.value as TimeHeatData;
      return `<b>${days[value.dayofweek]}</b> <b>${hours[value.hour]}</b>: ${value.pushes} pushes`;
    },
  }),
}), {
  aspectRatio: 24 / 10,
});
