import { CallbackDataParams, EChartsType, LabelFormatterCallback } from 'echarts/types/dist/shared';
import { ForwardedRef, forwardRef, Fragment, PropsWithChildren, useCallback, useMemo } from 'react';
import Axis from '../../components/option/axis';
import { Dataset, EChartsInitOptions, EChartsx, Grid, LineSeries, Once, Tooltip } from '../../index';
import { TypedKey } from '../sort-bar/hook';


export interface LineChartProps<T extends Record<string, unknown>> extends EChartsInitOptions {
  data: T[];
  fields: {
    name: TypedKey<T, string>
    time: TypedKey<T, string>
    value: TypedKey<T, number>
  };
  theme?: string
  formatTime?: (date: unknown) => string;
}

function useNames<T extends Record<string, unknown>>(data: T[], nameField: TypedKey<T, string>): string[] {
  return useMemo(() => {
    const set = new Set<string>();
    data.forEach(item => set.add(item[nameField] as unknown as string));
    return [...set].sort();
  }, [data, nameField]);
}

function LineChart<T extends Record<string, unknown>>({
  data,
  fields,
  children,
  theme,
  formatTime,
  ...init
}: PropsWithChildren<LineChartProps<T>>, ref: ForwardedRef<EChartsType>) {
  const names = useNames(data, fields.name);

  const timeLabelFormatter = useCallback((p: any) => {
    return formatTime?.(p.value) ?? String(p.value);
  }, [formatTime]);

  return (
    <EChartsx ref={ref} init={init} theme={theme}>
      <Once dependencies={names}>
        <Grid containLabel left={8} right={8} top={48} bottom={8} />
        <Axis.Time.X axisPointer={{ label: { formatter: timeLabelFormatter }}}/>
        <Axis.Value.Y />
        <Tooltip trigger="axis" axisPointer={{ type: 'cross' }} renderMode="html" confine formatter={((params: any[]) => {
          return `<b>${params[0].axisValueLabel}</b><br/>` +
          params
            .sort((a, b) => b.value[fields.value] - a.value[fields.value])
            .map((item: any) => `${item.marker}${item.value[fields.name]} <span style="float: right; margin-left: 16px;">${item.value[fields.value]}</span>`)
            .join('<br>')
        }) as any} />
        {names.map((name) => (
          <Fragment key={name}>
            <Dataset id={name} fromDatasetId="original"
                     transform={{ type: 'filter', config: { value: name, dimension: fields.name } }} />
            <LineSeries datasetId={name} name={name} encode={{ x: fields.time, y: fields.value }} showSymbol={false}
                        smooth emphasis={{ focus: 'series' }} />
          </Fragment>
        ))}
      </Once>
      <Dataset id="original" source={data} />
      {children}
    </EChartsx>
  );
}

export default forwardRef(LineChart);
