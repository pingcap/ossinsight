import React, { ForwardedRef, forwardRef, lazy, PropsWithChildren, Suspense } from 'react';
import AspectRatio from 'react-aspect-ratio';
import { isPositiveNumber } from '@site/src/utils/value';
import { Backdrop, CircularProgress } from '@mui/material';
import type EChartsReact from 'echarts-for-react';
import 'react-aspect-ratio/aspect-ratio.css';
import { EChartsType } from 'echarts/types/dist/shared';
import type { TypedKey } from '@djagger/echartsx/dist/charts/sort-bar/hook';

// TODO: Redesign lazy imports

const LazyECharts = lazy(async () => await import('./lazy').then(({ ECharts }) => ({ default: ECharts })));
const LazyEChartsx = lazy(async () => await import('./lazy').then(({ EChartsx }) => ({ default: EChartsx })));
const LazyLineChart: typeof import('@djagger/echartsx').LineChart = lazy(async () => await import('./lazy').then(({ LineChart }) => ({ default: LineChart }))) as never;
const LazyRankChart: typeof import('@djagger/echartsx').RankChart = lazy(async () => await import('./lazy').then(({ RankChart }) => ({ default: RankChart }))) as never;
const LazySortingBarChart: typeof import('@djagger/echartsx').SortingBarChart = lazy(async () => await import('./lazy').then(({ SortingBarChart }) => ({ default: SortingBarChart }))) as never;

const EChart = forwardRef(function AsyncECharts (props: Exclude<import('./ECharts').EChartsProps, 'echarts'>, ref: ForwardedRef<EChartsReact>) {
  if (typeof window === 'undefined') {
    return <LazyEChartsPlaceholder {...props} />;
  }
  return (
    <Suspense
      fallback={<LazyEChartsPlaceholder {...props} />}
    >
      <LazyECharts {...props} ref={ref} />
    </Suspense>
  );
});

function LazyEChartsPlaceholder ({ style, aspectRatio, height }: import('./ECharts').EChartsProps) {
  if (isPositiveNumber(aspectRatio)) {
    return (
      <AspectRatio ratio={aspectRatio} style={{ ...style, position: 'relative' }}>
        <Backdrop open sx={{ position: 'absolute' }}>
          <CircularProgress />
        </Backdrop>
      </AspectRatio>
    );
  } else {
    return (
      <div style={{ ...style, height: height ?? style?.height, position: 'relative' }}>
        <Backdrop open sx={{ position: 'absolute' }}>
          <CircularProgress />
        </Backdrop>
      </div>
    );
  }
}

export const EChartsx = forwardRef(function AsyncEChartsx (props: import('@djagger/echartsx').OptionProps, ref: ForwardedRef<EChartsType>) {
  if (typeof window === 'undefined') {
    return <LazyEChartsxPlaceholder style={props.style} />;
  }
  return (
    <Suspense
      fallback={<LazyEChartsxPlaceholder style={props.style} />}
    >
      <LazyEChartsx {...props} ref={ref} />
    </Suspense>
  );
});

export const LineChart = forwardRef(function <T> (props: PropsWithChildren<import('@djagger/echartsx').LineChartProps<T>>, ref: ForwardedRef<EChartsType>) {
  if (typeof window === 'undefined') {
    return <LazyEChartsxPlaceholder height={props.height} />;
  }
  return (
    <Suspense
      fallback={<LazyEChartsxPlaceholder height={props.height} />}
    >
      <LazyLineChart<T> {...props} ref={ref} />
    </Suspense>
  );
});

export const RankChart = forwardRef(function <T> (props: PropsWithChildren<import('@djagger/echartsx').RankChartProps<T>>, ref: ForwardedRef<EChartsType>) {
  if (typeof window === 'undefined') {
    return <LazyEChartsxPlaceholder height={props.height} />;
  }
  return (
    <Suspense
      fallback={<LazyEChartsxPlaceholder height={props.height} />}
    >
      <LazyRankChart<T> {...props} ref={ref} />
    </Suspense>
  );
});

export const SortingBarChart = forwardRef(function <T, N extends TypedKey<T, string>, K extends TypedKey<T, string>> (props: PropsWithChildren<import('@djagger/echartsx').SortingBarChartProps<T, N, K>>, ref: ForwardedRef<EChartsType>) {
  if (typeof window === 'undefined') {
    return <LazyEChartsxPlaceholder height={props.height} />;
  }
  return (
    <Suspense
      fallback={<LazyEChartsxPlaceholder height={props.height} />}
    >
      <LazySortingBarChart<T, N, K> {...props} ref={ref} />
    </Suspense>
  );
});

function LazyEChartsxPlaceholder ({ style, height }: { style?: any, height?: any }) {
  return <div style={{ ...style, height }} />;
}

export default EChart;
export type { EChartsProps } from './ECharts';
export { default as EChartsContext } from './context';
export type { EChartsContextProps } from './context';
