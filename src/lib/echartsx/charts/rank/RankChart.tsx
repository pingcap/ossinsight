import { EChartsType } from 'echarts/types/dist/shared';
import { ForwardedRef, forwardRef, Fragment, PropsWithChildren, useMemo } from 'react';
import { Once } from '../../components/controls';
import EChartsx, { EChartsInitOptions } from '../../components/EChartsx';
import { Axis, Dataset, Grid, LineSeries, Tooltip } from '../../components/option';
import { TypedKey } from '../sort-bar/hook';

export interface RankChartProps<T extends Record<string, unknown>> extends EChartsInitOptions {
  data: T[];
  fields: {
    name: TypedKey<T, string>
    time: TypedKey<T, string | number>
    value: TypedKey<T, number>
    rank: TypedKey<T, number>
  };
  theme?: string
}


function RankChart<T extends Record<string, unknown>>({
  data,
  fields,
  children,
  theme,
  ...opts
}: PropsWithChildren<RankChartProps<T>>, ref: ForwardedRef<EChartsType>) {
  const repos = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => {
      set.add(item[fields.name] as any);
    });
    return [...set];
  }, [data, fields.name]);

  return (
    <EChartsx theme={theme} init={{ renderer: 'canvas', ...opts }} ref={ref} defaults={{
      animationDuration: 3000,
      animationDurationUpdate: 3000,
    }}>
      <Once>
        <Grid containLabel top={72} left={24} right={108} />
        <Axis.Value.Y interval={1} min={1} inverse offset={16} axisPointer={{ show: true, type: 'shadow', snap: true, label: { precision: 0 }, triggerTooltip: false }} />
        <Axis.Time.X axisLabel={{ formatter: (p: string | number) => String(p), showMaxLabel: true }} minInterval={1}
                     maxInterval={1}
                     position="top" splitLine={{ show: true }} offset={28} axisLine={{ show: false }}
                     axisTick={{ show: false }}
                     axisPointer={{ show: true, type: 'line', snap: true, label: { formatter: ({ value }) => String(value) }, triggerTooltip: false }}
        />
        <Tooltip trigger="item" />
      </Once>
      <Once dependencies={repos}>
        {repos.map((repo) => (
          <Fragment key={repo}>
            <Dataset id={repo}
                     fromDatasetId="original"
                     transform={[
                       { type: 'filter', config: { value: repo, dimension: fields.name } },
                       { type: 'sort', config: { dimension: fields.time, order: 'asc' } }
                     ]} />
            <LineSeries name={repo} datasetId={repo} encode={{ x: fields.time, y: fields.rank }} smooth
                        lineStyle={{
                          width: 3,
                        }}
                        symbolSize={8}
                        symbol='circle'
                        endLabel={{
                          show: true,
                          offset: [12, 0],
                          width: 96,
                          fontSize: 14,
                          overflow: 'truncate',
                          formatter: (param) => {
                            const fullName = param.seriesName as string
                            const [owner, name] = fullName.split('/')
                            if (owner === name) {
                              return name
                            } else {
                              return `{owner|${owner}/}\n${name}`
                            }
                          },
                          rich: {
                            owner: {
                              fontSize: 12,
                              color: 'gray'
                            }
                          }
                        }}
                        emphasis={{ focus: 'series', label: { fontSize: 10 } }}
                        tooltip={{
                          formatter: '{a}'
                        }}
            />
          </Fragment>
        ))}
      </Once>
      <Dataset id="original" source={data} />
      {children}
    </EChartsx>
  );
}

export default forwardRef(RankChart);
