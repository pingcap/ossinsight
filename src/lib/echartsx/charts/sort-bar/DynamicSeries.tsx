import { EChartsOption } from 'echarts/types/dist/shared';
import { useContext } from 'react';
import { Once } from '../../components/controls';
import OptionContext from '../../components/EChartsx/OptionContext';
import { Axis } from '../../components/option';
import { TypedKey, useRealtime, UseRealtimeOptions } from './hook';

export default function DynamicSeries<T, nameKey extends TypedKey<T, string>, timeKey extends TypedKey<T, string>> ({
  data,
  interval,
  fields,
  onStart,
  onStop,
  max,
}: UseRealtimeOptions<T, nameKey, timeKey> & { max: number }) {
  const { setOption } = useContext(OptionContext)

  const { sortedNames } = useRealtime<T, nameKey, timeKey>({
    fields,
    data,
    interval,
    onStart,
    onStop,
  }, (part, time, sortedNames) => {
    setOption({
      series: [
        { id: 'time', type: 'scatter', data: [{id: 'time', value: time}] },
        { id: 'bars', type: 'bar', data: sortedNames.map(name => part[name as unknown as string]?.[fields.value] ?? 0)}
      ]
    } as EChartsOption)
  });

  return (
    <>
      <Once dependencies={sortedNames}>
        <Axis.Category.Y animationDurationUpdate={interval}
                         animationDuration={interval}
                         animationEasing='exponentialIn'
                         animationEasingUpdate='exponentialOut'
                         data={sortedNames as unknown[] as string[]} inverse max={Math.min(max, sortedNames.length) - 1}
                         axisLabel={{
                           fontSize: 14,
                           formatter: (param: string) => {
                             const [owner, name] = param.split('/')
                             if (owner === name) {
                               return name
                             } else {
                               return `{owner|${owner}/}\n${name}`
                             }
                           },
                           rich: {
                             owner: {
                               fontSize: 12,
                               opacity: 0.618
                             }
                           }
                         }}
        />
      </Once>
    </>
  )
}